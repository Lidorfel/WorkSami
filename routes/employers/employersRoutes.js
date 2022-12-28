const express = require("express");
const router = express.Router();
const cookieParser = require("../../app").cookieParser;
const sessions = require("../../app").sessions;
const employer = require("../../models/employers");
const job = require("../../models/jobs");
const student = require("../../models/Students");
const { db } = require("../../models/Students");

let session;

//employers
router.get("/", (req, res) => {
  res.render("./employers/employersPage");
});
router.get("/registerEm", (req, res) => {
  res.render("./employers/employersRegister");
});
router.get("/loginEm", (req, res) => {
  res.render("./employers/employersLogin");
});
router.get("/contact", (req, res) => {
  res.render("./employers/contactPageEM");
});
router.get("/employersLoggedinPage", async (req, res) => {
  if (session) {
    let li = [];
    employer.findOne({ email: session.userid }).then((user) => {
      const jobsRef = job.db.collection("jobs");
      jobsRef.find().toArray((err, jobsArray) => {
        jobsArray.forEach((job) => {
          if (user.jobsPosted.includes(job._id)) {
            li.push(job);
          }
        });
        res.render("./employers/employersLoggedinPage", { jobs: li });
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
        session = req.session;
        session.userid = req.body.email;
        console.log(session);
        if (user.isadmin === true) {
          console.log("is admin");
          res.redirect("/employers/admin");
        } else {
          res.redirect("/employers/employersLoggedinPage");
        }
      } else {
        res.redirect("/404");
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
});
router.post("/logoutemployer", (req, res) => {
  req.session.destroy();
  session = req.session;
  res.redirect("./");
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

//admin routes

router.get("/admin", (req, res) => {
  const jobsRef = job.db.collection("jobs");
  jobsRef.find().toArray((err, jobsArray) => {
    console.log(jobsArray);
    if (session) {
      res.render("./admin/adminPage", { jobsArray: jobsArray });
    } else {
      res.redirect("./");
    }
  });
});
router.post("/adminlogout", (req, res) => {
  req.session.destroy();
  session = req.session;
  res.redirect("./");
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
router.get("/employersLoggedinPage", (req, res) => {
  res.render("./employers/employersLoggedinPage");
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
    res.render("./admin/users");
  } else {
    res.redirect("./");
  }
});
router.get("/admin/jobsApprove", (req, res) => {
  if (session) {
    let li = [];
    const jobsRef = job.db.collection("jobs");
    jobsRef.find().toArray((err, jobsArray) => {
      jobsArray.forEach((job) => {
        if (!job.approved) {
          li.push(job);
        }
      });
      res.render("./admin/jobsApproval", { jobs: li });
    });
  } else {
    res.redirect("./");
  }
});

//admin new job
// router.post("/admin", async (req, res) => {
//   console.log(req.body);
//   job.db
//     .collection("jobs")
//     .insertOne({
//       companyName: req.body.name_job,
//       description: req.body.describe_job,
//       profession: req.body.job_type,
//       location: req.body.location,
//       approved: false,
//       candidates: [],
//     })
//     .then((newJob) => {
//       console.log("new job");
//       employer.db
//         .collection("employers")
//         .updateOne(
//           { email: 'worksami@gmail.com' },
//           { $push: { jobsPosted: newJob.insertedId } }
//         );
//       res.redirect("/employers/admin");
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// });
module.exports = router;
