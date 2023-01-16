const express = require("express");
const router = express.Router();
const cookieParser = require("../../app").cookieParser;
const sessions = require("../../app").sessions;
const employer = require("../../models/employers");
const job = require("../../models/jobs");
const student = require("../../models/Students");
const { db } = require("../../models/Students");
const request = require("../../models/request");
const nodemailer = require("nodemailer");
let session;

////// מעסיקים //////

////// דף מעסיקים לפני התחברות //////
router.get("/", (req, res) => {
  const valid = req.query.valid;
  if (valid === "novalid") {////// ברגע שמתשמש לא מחובר ניסה להיכנס ///////
    res.render("./employers/employersPage", {
      isApproved: "מצטערים, מנהל המערכת טרם אישר אותך",
    });
  } else {////// ברגע כניסה לדף בלי נסיון התחברות //////
    res.render("./employers/employersPage", { isApproved: "שלום" });
  }
});

////// דף הרשמה של מעסיקים //////
router.get("/registerEm", (req, res) => {
  res.render("./employers/employersRegister");
});

////// דף כניסה של מעסיקים //////
router.get("/loginEm", (req, res) => {
  res.render("./employers/employersLogin");
});

////// יצירת קשר של מעסיק עם מנהל המערכת //////
router.get("/contact", (req, res) => {
  if (session) {////// בדיקה שמשתמש מחובר //////
    employer.db
      .collection("employers")
      .findOne({ email: session.userid })
      .then((user) => {// שליחה של אובייקט המשתמש לדף הצור קשר של מחוברים
        res.render("./employers/contactPageEM", { emp: user });
      });
  } else {// כאשר לא מחובר נשלח לדף צור קשר של לא מחוברים
    res.redirect("/contact");
  }
});

////// שליחת בקשה של מעסיק אל מנהל המערכת //////
router.post("/contact", (req, res) => {
  if (req.body.contact_body_text.length > 0) {// בדיקה שגוף הפניה לא ריק
    request.db
      .collection("requests")
      .insertOne({// יצירת אובייקט של בקשה במונגו
        email: req.body.person_email,
        phone: req.body.person_phone,
        fullname: req.body.person_fullname,
        reqBody: req.body.contact_body_text,
      })
      .then((r) => {// ברגע הצלחה חוזרים לדף ראשי של מחוברים
        console.log("request created " + r._id);
        res.redirect("./employersloggedinpage");
      })
      .catch((err) => {
        console.log("request failed " + err);
      });
  } else {// במקרה ואין כלום בגוף הפנייה יעשה ריפרש לדף
    res.redirect("./contact");
  }
});

//////  דף כניסה של מעסיקים כאשר מחוברים //////
router.get("/employersLoggedinPage", async (req, res) => {
  if (session) {
    let li = [];
    employer.findOne({ email: session.userid }).then((user) => {// מוצאים את המעסיק במונגו
      const jobsRef = job.db.collection("jobs");
      jobsRef.find().toArray((err, jobsArray) => {// יוצרים מערך של כל המשרות
        jobsArray.forEach((job) => {
          if (user.jobsPosted.includes(job._id) && job.approved) {// מפלטרים משרות אם הם שייכות למעסיק וגם אם מאושרות
            li.push(job);
          }
        });
        li.sort((a, b) => {// ממינים את המערך משרות לפי תאריך העדכון
          if (a.updatedAt > b.updatedAt) {
            return -1;
          }
          if (a.updatedAt < b.updatedAt) {
            return 1;
          }
          return 0;
        });
        res.render("./employers/employersLoggedinPage", {// מועבר לדף עם כל המשרות וגם האובייקט של המעסיק עצמו
          jobs: li,
          emp: user,
        });
      });
    });
  } else {// ברגע שהוא לא מחובר
    res.redirect("./");
  }
});

//////  דף משרות ממתינות של מעסיקים //////
router.get("/waitingJobs", async (req, res) => {
  if (session) {
    let li = [];
    employer.findOne({ email: session.userid }).then((user) => {
      const jobsRef = job.db.collection("jobs");
      jobsRef.find().toArray((err, jobsArray) => {
        jobsArray.forEach((job) => {
          if (user.jobsPosted.includes(job._id) && !job.approved) {//יוצרים מערך עם המשרות של המעסיק שלא מאושרות
            li.push(job);
          }
        });
        li.sort((a, b) => {
          if (a.updatedAt > b.updatedAt) {
            return -1;
          }
          if (a.updatedAt < b.updatedAt) {
            return 1;
          }
          return 0;
        });
        res.render("./employers/waitingJobs", {
          jobs: li,
          emp: user,
        });
      });
    });
  } else {
    res.redirect("./");
  }
});

//////  דף הרשמה מעסיקים - לחיצה על כפתור הרשמה //////
router.post("/registerEm", async (req, res) => {
  await employer.db
    .collection("employers")
    .insertOne({// הכנסת אובייקט למונגו עם כל הפרטים של ההרשמה
      fullname: req.body.fullname,
      id: req.body.id,
      phone: req.body.phone,
      email: req.body.email_user,
      password: req.body.password,
      companyName: req.body.companyName,
      line_of_business: req.body.line_of_business,
      location: req.body.location,
      urlcompany: req.body.urlcompany,
      linkedin: req.body.linkedin,
      jobsPosted: [],
      isadmin: false,
      approved: false,
    })
    .then(() => {
      console.log("user created");
    })
    .catch((err) => {
      console.log(err.message);
    });
  res.redirect("/employers/loginEm");//מעבר חזרה לדף כניסה
});

//////  דף כניסה של מעסיקים - לחיצה על התחברות//////
router.post("/loginEm", async (req, res) => {
  employer
    .findOne({ email: req.body.email })
    .then((user) => {
      if (user.password === req.body.password) {
        if (user.isadmin === true) {/// בדיקת אדמין
          session = req.session;
          session.userid = req.body.email;
          console.log(session);
          console.log("is admin");
          res.redirect("/employers/admin");// העברה לדף אדמין
        } else {// לא אדמין
          if (user.approved) {// בדיקה האם מאושר
            session = req.session;
            session.userid = req.body.email;
            console.log(session);
            res.redirect("/employers/employersLoggedinPage");// מעביר לדף מעסיק מחובר
          } else {// אם לא מאושר
            res.redirect("/employers/?valid=" + "novalid");// מחזיר לדף של מעסיקים עם הודעה על אי אישור
          }
        }
      } else {
        res.redirect("/404");// שגיאה בסיסמה
      }
    })
    .catch((err) => {
      res.redirect("/404");
    });
});

////// לחיצה על כפתור התנתקות //////
router.post("/logoutemployer", (req, res) => {
  req.session.destroy();// מחיקת SESSION
  session = req.session;
  res.redirect("/");//מעבר לדף ראשי
});

//////  הוספת משרה של מעסיק //////
router.post("/employersLoggedinPage", async (req, res) => {
  console.log(req.body);
  job.db
    .collection("jobs")
    .insertOne({// אובייקט של משרה חדשה במונגו
      UniqueID: Math.floor(Math.random() * 100000000).toString(),
      companyName: req.body.name_job,
      description: req.body.describe_job,
      profession: req.body.job_type,
      location: req.body.location,
      approved: false,
      candidates: [],
      updatedAt: Date.now(),
    })
    .then((newJob) => {
      console.log("new job");
      employer.db
        .collection("employers")
        .updateOne(
          { email: session.userid },
          { $push: { jobsPosted: newJob.insertedId } }//הוספת אי די של משרה אל מערך המשרות של המעסיק
        );
      res.redirect("/employers/employersLoggedinPage");// העברה לדף מחוברים
    })
    .catch((err) => {
      console.log(err.message);
    });
});

////// דף רשימת מועמדים למשרה//////
router.get("/employersLoggedinPage/seeCandidate/:id", async (req, res) => {
  if (session) {
    let li = [];
    let jobtemp = {};
    const id = req.params.id;
    await job.findById(id).then(async (jobFound) => {
      jobtemp = jobFound;
      jobFound.candidates.forEach((emailFound) => {//ריצה על מערך מועמדים
        student.db
          .collection("students")
          .findOne({ email: emailFound })
          .then((user) => {// ברגע מציאת סטודנט מועמד נכניס למערך מועמדים את האובייקט
            li.push(user);
          });
      });
    });
    const timer = setTimeout(() => {
      res.render("./employers/employer_candidate", {// העברה לדף עם הרשימת מועמדים ועם הפרטים של המשרה
        candidates: li,
        jobFound: jobtemp,
      });
    }, 800);
  } else {
    res.redirect("./");
  }
});

//////  דף עדכון פרטים של מעסיק //////
router.get("/employersUpdate", (req, res) => {
  if (session) {
    employer.db
      .collection("employers")
      .findOne({ email: session.userid })
      .then((user) => {
        res.render("./employers/employersUpdate", { employer: user });// העברה לדף עדכון עם אובייקט של המעסיק
      });
  } else {
    res.redirect("./");
  }
});

//////  לחיצה על עדכון של מעסיק //////
router.post("/employersUpdate", (req, res) => {
  console.log(session.userid);
  const updObject = {};
  if (req.body.new_password) {// בודק אם כל שדה התקבל או NULL
    updObject["password"] = req.body.new_password;
  }
  if (req.body.phone_number) {
    updObject["phone"] = req.body.phone_number;
  }
  if (req.body.email) {
    updObject["email"] = req.body.email;
  }
  if (req.body.urlcomapny) {
    updObject["urlcompany"] = req.body.urlcompany;
  }
  if (req.body.linkedin) {
    updObject["linkedin"] = req.body.linkedin;
  }
  console.log(updObject);
  employer.db.collection("employers").updateOne(//מעדכן אובייקט
    { email: session.userid },
    {
      $set: updObject,
    }
  );
  res.redirect("/employers/employersloggedinpage");//מחזיר לדף ראשי של מעסיקים מחוברים
});

//////  מחיקת משרה של מעסיק //////
router.post("/employersloggedinpage/deleteJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {//חיפוש משרה לפי אי די
      employer.db
        .collection("employers")
        .updateOne({ email: session.userid }, { $pull: { jobsPosted: j._id } });//עדכון של מערך משרות של מעסיק
      job.db.collection("jobs").deleteOne({ UniqueID: j.UniqueID });//מחיקת משרה מרשימת משרות
      res.redirect("/employers/employersloggedinpage");
    });
  } else {
    res.redirect("./");
  }
});

//////  דף עדכון משרה של מעסיק //////
router.get("/employersloggedinpage/updateJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      employer.db
        .collection("employers")
        .findOne({ email: session.userid })
        .then((user) => {
          res.render("./employers/updateJob", {// העברה לדף עם פרטי מעסיק ועם פרטי משרה
            job: j,
            emp: user,
          });
        });
    });
  } else {
    res.redirect("./");
  }
});

////// ברגע לחיצה על עדכון משרה - מעסיק //////
router.post("/employersloggedinpage/updateJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    const updJob = {};
    if (req.body.describe_job) {
      updJob["description"] = req.body.describe_job;
    }
    if (req.body.job_type) {
      updJob["profession"] = req.body.job_type;
    }
    if (req.body.location) {
      updJob["location"] = req.body.location;
    }
    job.findById(id).then((j) => {
      job.db
        .collection("jobs")
        .updateOne({ UniqueID: j.UniqueID }, { $set: updJob });//עדכון משרה
      res.redirect("/employers/employersloggedinpage");
    });
  } else {
    res.redirect("./");
  }
});





////////////// אדמין //////////////////

////// אדמין - הצגת דף ראשי //////
router.get("/admin", (req, res) => {
  if (session) {
    const jobsRef = job.db.collection("jobs");
    jobsRef.find().toArray((err, jobsArray) => {
      const li = jobsArray.filter((j) => {
        return j.approved;
      });
      li.sort((a, b) => {
        if (a.updatedAt > b.updatedAt) {
          return -1;
        }
        if (a.updatedAt < b.updatedAt) {
          return 1;
        }
        return 0;
      });
      employer.db
        .collection("employers")
        .findOne({ email: "worksami@gmail.com" })
        .then((admin) => {
          // console.info(jobsArray);
          // console.info(li);
          // console.log(admin);
          const arr = [];
          for (let i = 0; i < admin.jobsPosted.length; i++) {
            arr.push(admin.jobsPosted[i]);
          }
          const arr2 = arr.map((j) => {
            return j.toString();
          });
          res.render("./admin/adminPage", {//שליחה לדף של אדמין עם רשימת משרטת ורשימת משרות של אדמין
            jobsArray: li,
            admin: arr2,
          });
        });
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - התנתקות //////
router.post("/adminlogout", (req, res) => {
  req.session.destroy();
  session = req.session;
  res.redirect("/");//העברה לדף ראשי של האתר
});

////// אדמין - העלאת משרה //////
router.post("/admin", (req, res) => {
  job.db
    .collection("jobs")
    .insertOne({
      UniqueID: Math.floor(Math.random() * 100000000).toString(),
      companyName: req.body.name_job,
      description: req.body.describe_job,
      profession: req.body.job_type,
      location: req.body.location,
      approved: true,
      candidates: [],
      updatedAt: Date.now(),
    })
    .then((newJob) => {
      console.log("new job");
      employer.db
        .collection("employers")
        .updateOne(
          { email: "worksami@gmail.com" },
          { $push: { jobsPosted: newJob.insertedId } }
        );
      res.redirect("/employers/admin");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

////// אדמין - הצגת מועמדים של משרה //////
router.get("/admin/seeCandidate/:id", async (req, res) => {
  if (session) {
    let li = [];
    let jobtemp = {};
    const id = req.params.id;
    await job.findById(id).then((jobFound) => {
      jobtemp = jobFound;
      jobFound.candidates.forEach((emailFound) => {
        student.db
          .collection("students")
          .findOne({ email: emailFound })
          .then((user) => {
            li.push(user);
          });
      });
    });
    const timer = setTimeout(() => {
      res.render("./admin/admin_candidate", {
        candidates: li,
        jobFound: jobtemp,
      });
    }, 800);
  } else {
    res.redirect("./");
  }
});


////// אדמין - הצגת דף של כל המשתמשים באתר //////
router.get("/admin/allUsers", (req, res) => {
  if (session) {
    const stuRef = student.db.collection("students");
    stuRef.find().toArray((err, studentsArray) => {
      const empRef = employer.db.collection("employers");
      empRef.find().toArray((err, employersArray) => {
        res.render("./admin/users", {//שליחה לדף עם מערך של סטודנטים ומערך ששל מעסיקים
          studentsArray: studentsArray,
          employersArray: employersArray,
        });
      });
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - הצגת דף אישור משרות //////
router.get("/admin/jobsApprove", (req, res) => {
  if (session) {
    const jobsRef = job.db.collection("jobs");
    jobsRef.find().toArray((err, jobsArray) => {
      const li = jobsArray.filter((j) => {//פילטור משרות לפי לא מאושר
        return !j.approved;
      });
      li.sort((a, b) => {
        if (a.updatedAt > b.updatedAt) {
          return -1;
        }
        if (a.updatedAt < b.updatedAt) {
          return 1;
        }
        return 0;
      });
      res.render("./admin/jobsApproval", { jobs: li.reverse() });//יעביר לדף עם כלל המשרות בסדר הפוך
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על אישור סטודנט //////
router.post("/admin/allUsers/student/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    student.findById(id).then((stu) => {
      student.db
        .collection("students")
        .updateOne({ email: stu.email }, { $set: { approved: true } });
      res.redirect("/employers/admin/allUsers");//מחזיר לאותו דף(רענון)
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על אישור מעסיק //////

router.post("/admin/allUsers/employer/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    employer.findById(id).then((emp) => {
      employer.db
        .collection("employers")
        .updateOne({ email: emp.email }, { $set: { approved: true } });//עדכון שדה מאושר לTRUE
      res.redirect("/employers/admin/allUsers");
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על מחיקת מעסיק //////

router.post("/admin/allUsers/DELemployer/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    employer.findById(id).then((emp) => {
      employer.db.collection("employers").deleteOne({ email: emp.email });//מוחק מעסיק מ מונגו
      res.redirect("/employers/admin/allUsers");
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על מחיקת סטודנט //////

router.post("/admin/allUsers/DELstudent/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    student.findById(id).then((stu) => {
      student.db.collection("students").deleteOne({ email: stu.email });//מחיקת סטודנט ממונגו
      res.redirect("/employers/admin/allUsers");
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על אישור משרה //////
router.post("/admin/jobs/approveJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      job.db
        .collection("jobs")
        .updateOne({ UniqueID: j.UniqueID }, { $set: { approved: true } });//עדכון שדה מאושר ל TRUE
      res.redirect("/employers/admin/jobsApprove");
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על מחיקת משרה //////
router.post("/admin/jobs/deleteJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      job.db.collection("jobs").deleteOne({ UniqueID: j.UniqueID });
      res.redirect("/employers/admin/jobsApprove");
    });
  } else {
    res.redirect("./");
  }
});


////// אדמין - ברגע לחיצה על מחקית משרה //////

router.post("/admin/deleteJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      job.db.collection("jobs").deleteOne({ UniqueID: j.UniqueID });// מוחקים משרה
      res.redirect("/employers/admin");
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - הצגת דף עדכון משרה//////
router.get("/admin/updateJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      employer.db
        .collection("employers")
        .findOne({ email: "worksami@gmail.com" })
        .then((user) => {
          res.render("./employers/updateJob", {//שליחת פרטי משרה ופרטי מנהל ערכת לדף 
            job: j,
            emp: user,
          });
        });
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על עדכון משרה  //////
router.post("/admin/updateJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    const updJob = {};
    if (req.body.describe_job) {//בדיקה למקרה ושדה ריק
      updJob["description"] = req.body.describe_job;
    }
    if (req.body.job_type) {
      updJob["profession"] = req.body.job_type;
    }
    if (req.body.location) {
      updJob["location"] = req.body.location;
    }
    job.findById(id).then((j) => {
      job.db
        .collection("jobs")
        .updateOne({ UniqueID: j.UniqueID }, { $set: updJob });//עדכון משרה
      res.redirect("/employers/admin");
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על עדכון מיקום משרה(חץ) //////
router.post("/admin/jobPosition/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      job.db
        .collection("jobs")
        .findOneAndUpdate(
          { UniqueID: j.UniqueID },
          { $set: { updatedAt: Date.now() } },//עדכון זמן של המשרה לעכשיו
          { new: true }
        );
      res.redirect("/employers/admin");
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - הצגת דף של בקשות משתמשים //////
router.get("/admin/usersRequests", (req, res) => {
  if (session) {
    const reqRef = request.db.collection("requests");
    reqRef.find().toArray((err, reqArray) => {
      res.render("./admin/usersRequests", { reqArray: reqArray });//העברה לדף בקשות עם מערך כל הבקשות של המשתמשים
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על מחיקת בקשה //////
router.post("/admin/usersRequests/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    request.findById(id).then((r) => {
      request.db.collection("requests").deleteOne({ email: r.email });// מחיקת בקשה
      res.redirect(req.get("referer"));
    });
  } else {
    res.redirect("./");
  }
});

////// אדמין - ברגע לחיצה על שליחת מייל חזרה למשתמש //////
router.post("/admin/usersRequests/sendEmail/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    const adminEmail = "worksamisce@gmail.com";
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: adminEmail,
        pass: "wvhfbeleusgkikjd",
      },
    });
    request.findById(id).then((r) => {
      const message = req.body.adminRespond;
      if (r) {
        let mailOptions = {
          from: adminEmail,
          to: r.email,
          subject: "Respond from WorkSami about your Request",
          text: message,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log(`Email sent: ${info.response}`);
            res.redirect(req.get("referer"));
          }
        });
      } else {
        res.redirect("/employers/admin");
      }
    });
  } else {
    res.redirect("./");
  }
});

module.exports = router;
