const express = require("express");
const cookieParser = require("../../app").cookieParser;
const sessions = require("../../app").sessions;
const router = express.Router();
const student = require("../../models/Students");
const job = require("../../models/jobs");
const cons = require("consolidate");
const { default: mongoose } = require("mongoose");
const request = require("../../models/request");
const employer = require("../../models/employers");
let session;

// var db = require("../../app");
// const User = require("../../models/User");



///////// סטודנטים //////////////

/////// דף סטודנטים ///////
router.get("/", (req, res) => {
  const valid = req.query.valid;
  if (valid === "novalid") {// למקרה וניסה להתחבר ועדיין לא מאושר
    res.render("./students/studentsPage", {
      isApproved: "מצטערים, מנהל המערכת טרם אישר אותך",
    });
  } else {
    res.render("./students/studentsPage", { isApproved: "שלום" });
  }
});
/////// סטודנט - דף צור קשר ///////
router.get("/contact", (req, res) => {
  if (session) {
    student.db
      .collection("students")
      .findOne({ email: session.userid })
      .then((user) => {
        res.render("./students/contactPageST", { stu: user });// העברה לדף צור קשר סטודנט עם פרטי סטודנט
      });
  } else {
    res.redirect("/contact");// שולח לדף צור קשר כללי
  }
});

/////// סטודנט - ברגע שליחה על שליחת בקשה ///////
router.post("/contact", (req, res) => {
  if (req.body.contact_body_text.length > 0) {// בדיקה שגוף הבקשה לא ריק
    request.db
      .collection("requests")
      .insertOne({// יצירת בקשה חדשה
        email: req.body.person_email,
        phone: req.body.person_phone,
        fullname: req.body.person_fullname,
        reqBody: req.body.contact_body_text,
      })
      .then((r) => {
        console.log("request created " + r._id);
        res.redirect("./studentMainPage");//ברגע הצלחה מוחזרים לדף רשאי של סטודנט מחובר
      })
      .catch((err) => {
        console.log("request failed " + err);
      });
  } else {
    res.redirect("./contact");//אם גוף הבקשה ריק יעשה רענון לדף
  }
});

/////// סטודנט - דף הרשמה///////
router.get("/registerSt", (req, res) => {
  res.render("./students/StudentRegister");
});

/////// סטודנט - דף כניסה ///////
router.get("/loginSt", (req, res) => {
  res.render("./students/studentLogin");
});

/////// סטודנט - ברגע לחיצה על התחברות ///////
router.post("/loginSt", async (req, res) => {
  try {
    student
      .findOne({ email: req.body.email })
      .then((user) => {
        if (user.password === req.body.password) {
          if (user.approved) {// סטודנט מאושר יועבר לדף ראיש של סטודנט מחובר
            session = req.session;
            session.userid = req.body.email;
            console.log(session);
            res.redirect("/students/studentMainPage");
          } else {// לא מאושר מועבר חזרה עם שגיאה
            res.redirect("/students/?valid=" + "novalid");
          }
        } else {
          res.redirect("/404");
        }
      })
      .catch((err) => {
        console.log(err.message);
        res.redirect("/404");
      });
  } catch {
    (err) => {
      res.redirect("/404");
    };
  }
});


/////// סטודנט - דף עדכון פרטים ///////
router.get("/studentsUpdate", (req, res) => {
  // const id = req.params.id;
  if (session) {
    student.db
      .collection("students")
      .findOne({ email: session.userid })
      .then((user) => {
        res.render("./students/studentsUpdate", { student: user });
      });
  } else {
    res.redirect("./");
  }
});

/////// סטודנט - דף ראשי כאשר מחובר ///////
router.get("/studentMainPage", (req, res) => {
  // const id = req.params.id;
  // const valid = req.query.valid;
  // console.log("is valid? " + valid);

  if (session) {
    let li = [];
    const jobsRef = job.db.collection("jobs");
    student.findOne({ email: session.userid }).then((user) => {
      jobsRef.find().toArray((err, jobsArray) => {
        jobsArray.forEach((job) => {
          if (job.approved) {//בדיקה אם משרה מאושרת
            li.push(job);
          }
        });
        li.sort((a, b) => {// סידור משרות לפי תאריך עדכון
          if (a.updatedAt > b.updatedAt) {
            return -1;
          }
          if (a.updatedAt < b.updatedAt) {
            return 1;
          }
          return 0;
        });
        //סיפור משתמש מועדפים
        for (let i = 0; i < li.length; i++) {
          if (user.likedJobs.includes(li[i]._id)) {
            console.log(li[i]);
            li.unshift(li.splice(i, 1)[0]);// העלאת המשרה המועדפת לראש הרשימה
          }
        }
        res.render("./students/studentMainPage", {// שליחה לדף עם כלל המשרות המאושרות ועם המשרות המועדפות
          jobsArray: li,
          likedJobs: user.likedJobs,
          studentEmail: session.userid,
        });
      });
    });
  } else {
    res.redirect("./");
  }
});


/////// סטודנט - ברגע לחיצה על הרשמה ///////
router.post("/registerSt", async (req, res) => {
  student.db
    .collection("students")
    .insertOne({//יצירת אובייקט חדש של סטודנט במונגו
      fullname: req.body.fullname,
      id: req.body.userId,
      phone: req.body.phone_user,
      email: req.body.email_user,
      password: req.body.password,
      gender: req.body.gender_select,
      status: req.body.study_year,
      department: req.body.study_profession,
      startdate: req.body.strat_date,
      enddate: req.body.finish_date,
      avg: req.body.avrage_grade,
      findjob: false,
      likedJobs: [],
      approved: false,
    })
    .then(() => {
      console.log("user created");
    })
    .catch((err) => {
      console.log(err.message);
    });
  res.redirect("/students/loginSt");//מועברים חזרה לדף כניסה
});

/////// סטודנט - ברגע לחיצה על לב ///////
router.post("/studentMainPage/likejob/:id", (req, res) => {
  console.log("like", req.params.id);
  const id = req.params.id;
  student.db
    .collection("students")
    .updateOne({ email: session.userid }, { $push: { likedJobs: id } });// מוצא סטונדט לפי אימייל ומוסיף משרה למערך של משרות מועדפות
  res.redirect("/students/studentMainPage");
});

/////// סטודנט - ברגע ביטול לב ///////
router.post("/studentMainPage/unlikejob/:id", (req, res) => {
  console.log("unlike");
  const id = req.params.id;
  student.db
    .collection("students")
    .updateOne({ email: session.userid }, { $pull: { likedJobs: id } });//הוצאה של משרה מהמועדפים
  res.redirect("/students/studentMainPage");
});

/////// סטודנט - לחיצה על הגשת מועמדות ///////
router.post("/studentMainPage/applyToJob/:id", (req, res) => {
  const jobid = req.params.id;
  job.findById(jobid).then((jobFound) => {//מציאת משרה
    job.db
      .collection("jobs")
      .updateOne(//עדכון של מערך מועמדים של משרה עם אימייל של מועמד חדש
        { UniqueID: jobFound.UniqueID },
        { $push: { candidates: session.userid } }
      );
    res.redirect("/students/studentMainPage");
  });
});

/////// סטודנט - שורת חיפוש+חיפוש מתקדם ///////
router.post("/studentMainPage/afterFilterJob/", (req, res) => {
  if (session) {
    const companyName = req.body.name_job;
    const type = req.body.job_type;
    const location = req.body.location;
    // let flag1 = 0;
    // let flag2 = 0;
    let li = [];
    student.db
      .collection("students")
      .findOne({ email: session.userid })
      .then((user) => {
        const jobRef = job.db.collection("jobs");
        jobRef.find().toArray((err, jobArr) => {
          const filterArray = (array, filter1, filter2, filter3) => {//פונקצית פילטור
            return array.filter((item) => {
              if (!filter1 && !filter2 && !filter3) {
                return true;
              } else {
                return (
                  (filter1 ? item.companyName === filter1 : true) &&
                  (filter2 ? item.profession === filter2 : true) &&
                  (filter3 ? item.location === filter3 : true)
                );
              }
            });
          };
          li = filterArray(jobArr, companyName, type, location);// קריאה לפונקצית פילטור עם המערך משרות ועם הפילטורים
          newLi = li.filter((item) => {
            return item.approved === true;//פילטור נוסף שמשרה אכן מאושרת
          });
          res.render("./students/studentMainPage", {// העברה לדף עם כלל המשרות, משרות מועדות ומייל של סטודנט
            jobsArray: newLi,
            likedJobs: user.likedJobs,
            studentEmail: session.userid,
          });
        });
      });
  } else {
    res.redirect("./");
  }
});


/////// סטודנט - התנתקות  ///////
router.post("/logout", (req, res) => {
  req.session.destroy();//מחיקת סשן
  session = req.session;
  res.redirect("/");
});


/////// סטודנט - ברגע לחיצה על עדכון פרטים ///////
router.post("/studentsUpdate", (req, res) => {
  console.log(session.userid);
  const updObj = {};
  if (req.body.new_password) {// בודק מה לא ריק
    updObj["password"] = req.body.new_password;
  }
  if (req.body.phone_number) {
    updObj["phone"] = req.body.phone_number;
  }
  if (req.body.email) {
    updObj["email"] = req.body.email;
  }
  if (req.body.study_year) {
    updObj["status"] = req.body.study_year;
  }
  if (req.body.avrage_grade) {
    updObj["avg"] = req.body.avrage_grade;
  }
  if (req.body.findajob === "yes") {
    updObj["findjob"] = true;
  } else if (req.body.findajob === "no") {
    updObj["findjob"] = false;
  }
  console.log(updObj);
  student.db.collection("students").updateOne(
    { email: session.userid },
    {
      $set: updObj,// מעדכן
    }
  );

  res.redirect("/students/studentsUpdate");
});

module.exports = router;
