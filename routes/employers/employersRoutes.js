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

//employers
router.get("/", (req, res) => {
  const valid = req.query.valid;
  if (valid === "novalid") {
    res.render("./employers/employersPage", {
      isApproved: "מצטערים, מנהל המערכת טרם אישר אותך",
    });
  } else {
    res.render("./employers/employersPage", { isApproved: "שלום" });
  }
});
router.get("/registerEm", (req, res) => {
  res.render("./employers/employersRegister");
});
router.get("/loginEm", (req, res) => {
  res.render("./employers/employersLogin");
});
router.get("/contact", (req, res) => {
  if (session) {
    employer.db
      .collection("employers")
      .findOne({ email: session.userid })
      .then((user) => {
        res.render("./employers/contactPageEM", { emp: user });
      });
  } else {
    res.redirect("/contact");
  }
});
router.post("/contact", (req, res) => {
  if (req.body.contact_body_text.length > 0) {
    request.db
      .collection("requests")
      .insertOne({
        email: req.body.person_email,
        phone: req.body.person_phone,
        fullname: req.body.person_fullname,
        reqBody: req.body.contact_body_text,
      })
      .then((r) => {
        console.log("request created " + r._id);
        res.redirect("./employersloggedinpage");
      })
      .catch((err) => {
        console.log("request failed " + err);
      });
  } else {
    res.redirect("./contact");
  }
});
router.get("/employersLoggedinPage", async (req, res) => {
  if (session) {
    let li = [];
    employer.findOne({ email: session.userid }).then((user) => {
      const jobsRef = job.db.collection("jobs");
      jobsRef.find().toArray((err, jobsArray) => {
        jobsArray.forEach((job) => {
          if (user.jobsPosted.includes(job._id) && job.approved) {
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
        res.render("./employers/employersLoggedinPage", {
          jobs: li,
          emp: user,
        });
      });
    });
  } else {
    res.redirect("./");
  }
});

router.get("/waitingJobs", async (req, res) => {
  if (session) {
    let li = [];
    employer.findOne({ email: session.userid }).then((user) => {
      const jobsRef = job.db.collection("jobs");
      jobsRef.find().toArray((err, jobsArray) => {
        jobsArray.forEach((job) => {
          if (user.jobsPosted.includes(job._id) && !job.approved) {
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

router.post("/registerEm", async (req, res) => {
  employer.db
    .collection("employers")
    .insertOne({
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
  res.redirect("/employers/loginEm");
});

router.post("/loginEm", async (req, res) => {
  employer
    .findOne({ email: req.body.email })
    .then((user) => {
      if (user.password === req.body.password) {
        if (user.isadmin === true) {
          session = req.session;
          session.userid = req.body.email;
          console.log(session);
          console.log("is admin");
          res.redirect("/employers/admin");
        } else {
          if (user.approved) {
            session = req.session;
            session.userid = req.body.email;
            console.log(session);
            res.redirect("/employers/employersLoggedinPage");
          } else {
            res.redirect("/employers/?valid=" + "novalid");
          }
        }
      } else {
        res.redirect("/404");
      }
    })
    .catch((err) => {
      res.redirect("/404");
    });
});
router.post("/logoutemployer", (req, res) => {
  req.session.destroy();
  session = req.session;
  res.redirect("/");
});
//post in job
router.post("/employersLoggedinPage", async (req, res) => {
  console.log(req.body);
  job.db
    .collection("jobs")
    .insertOne({
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
          { $push: { jobsPosted: newJob.insertedId } }
        );
      res.redirect("/employers/employersLoggedinPage");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

router.get("/employersLoggedinPage/seeCandidate/:id", async (req, res) => {
  if (session) {
    let li = [];
    let jobtemp = {};
    const id = req.params.id;
    await job.findById(id).then(async (jobFound) => {
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
      res.render("./employers/employer_candidate", {
        candidates: li,
        jobFound: jobtemp,
      });
    }, 800);
  } else {
    res.redirect("./");
  }
});

router.get("/employersUpdate", (req, res) => {
  if (session) {
    employer.db
      .collection("employers")
      .findOne({ email: session.userid })
      .then((user) => {
        res.render("./employers/employersUpdate", { employer: user });
      });
  } else {
    res.redirect("./");
  }
});
router.post("/employersUpdate", (req, res) => {
  console.log(session.userid);
  const updObject = {};
  if (req.body.new_password) {
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
  employer.db.collection("employers").updateOne(
    { email: session.userid },
    {
      $set: updObject,
    }
  );
  res.redirect("/employers/employersloggedinpage");
});
router.post("/employersloggedinpage/deleteJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      employer.db
        .collection("employers")
        .updateOne({ email: session.userid }, { $pull: { jobsPosted: j._id } });
      job.db.collection("jobs").deleteOne({ UniqueID: j.UniqueID });
      res.redirect("/employers/employersloggedinpage");
    });
  } else {
    res.redirect("./");
  }
});
router.get("/employersloggedinpage/updateJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      employer.db
        .collection("employers")
        .findOne({ email: session.userid })
        .then((user) => {
          res.render("./employers/updateJob", {
            job: j,
            emp: user,
          });
        });
    });
  } else {
    res.redirect("./");
  }
});

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
        .updateOne({ UniqueID: j.UniqueID }, { $set: updJob });
      res.redirect("/employers/employersloggedinpage");
    });
  } else {
    res.redirect("./");
  }
});

//admin routes

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
          res.render("./admin/adminPage", {
            jobsArray: li,
            admin: arr2,
          });
        });
    });
  } else {
    res.redirect("./");
  }
});
router.post("/adminlogout", (req, res) => {
  req.session.destroy();
  session = req.session;
  res.redirect("/");
});
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

router.get("/admin/allUsers", (req, res) => {
  if (session) {
    const stuRef = student.db.collection("students");
    stuRef.find().toArray((err, studentsArray) => {
      const empRef = employer.db.collection("employers");
      empRef.find().toArray((err, employersArray) => {
        res.render("./admin/users", {
          studentsArray: studentsArray,
          employersArray: employersArray,
        });
      });
    });
  } else {
    res.redirect("./");
  }
});
router.get("/admin/jobsApprove", (req, res) => {
  if (session) {
    const jobsRef = job.db.collection("jobs");
    jobsRef.find().toArray((err, jobsArray) => {
      const li = jobsArray.filter((j) => {
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
      res.render("./admin/jobsApproval", { jobs: li.reverse() });
    });
  } else {
    res.redirect("./");
  }
});
router.post("/admin/allUsers/student/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    student.findById(id).then((stu) => {
      student.db
        .collection("students")
        .updateOne({ email: stu.email }, { $set: { approved: true } });
      res.redirect("/employers/admin/allUsers");
    });
  } else {
    res.redirect("./");
  }
});
router.post("/admin/allUsers/employer/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    employer.findById(id).then((emp) => {
      employer.db
        .collection("employers")
        .updateOne({ email: emp.email }, { $set: { approved: true } });
      res.redirect("/employers/admin/allUsers");
    });
  } else {
    res.redirect("./");
  }
});
router.post("/admin/allUsers/DELemployer/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    employer.findById(id).then((emp) => {
      employer.db.collection("employers").deleteOne({ email: emp.email });
      res.redirect("/employers/admin/allUsers");
    });
  } else {
    res.redirect("./");
  }
});
router.post("/admin/allUsers/DELstudent/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    student.findById(id).then((stu) => {
      student.db.collection("students").deleteOne({ email: stu.email });
      res.redirect("/employers/admin/allUsers");
    });
  } else {
    res.redirect("./");
  }
});
router.post("/admin/jobs/approveJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      job.db
        .collection("jobs")
        .updateOne({ UniqueID: j.UniqueID }, { $set: { approved: true } });
      res.redirect("/employers/admin/jobsApprove");
    });
  } else {
    res.redirect("./");
  }
});
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
router.post("/admin/deleteJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      job.db.collection("jobs").deleteOne({ UniqueID: j.UniqueID });
      res.redirect("/employers/admin");
    });
  } else {
    res.redirect("./");
  }
});
router.get("/admin/updateJOB/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      employer.db
        .collection("employers")
        .findOne({ email: "worksami@gmail.com" })
        .then((user) => {
          res.render("./employers/updateJob", {
            job: j,
            emp: user,
          });
        });
    });
  } else {
    res.redirect("./");
  }
});
router.post("/admin/updateJOB/:id", (req, res) => {
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
        .updateOne({ UniqueID: j.UniqueID }, { $set: updJob });
      res.redirect("/employers/admin");
    });
  } else {
    res.redirect("./");
  }
});
router.post("/admin/jobPosition/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    job.findById(id).then((j) => {
      job.db
        .collection("jobs")
        .findOneAndUpdate(
          { UniqueID: j.UniqueID },
          { $set: { updatedAt: Date.now() } },
          { new: true }
        );
      res.redirect("/employers/admin");
    });
  } else {
    res.redirect("./");
  }
});
router.get("/admin/usersRequests", (req, res) => {
  if (session) {
    const reqRef = request.db.collection("requests");
    reqRef.find().toArray((err, reqArray) => {
      res.render("./admin/usersRequests", { reqArray: reqArray });
    });
  } else {
    res.redirect("./");
  }
});
router.post("/admin/usersRequests/:id", (req, res) => {
  if (session) {
    const id = req.params.id;
    request.findById(id).then((r) => {
      request.db.collection("requests").deleteOne({ email: r.email });
      res.redirect(req.get("referer"));
    });
  } else {
    res.redirect("./");
  }
});
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
