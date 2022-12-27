const { json } = require("body-parser");
const cons = require("consolidate");
const express = require("express");
const router = express.Router();
const cookieParser = require("../../app").cookieParser;
const sessions = require("../../app").sessions;
const employer = require("../../models/employers");
const job = require("../../models/jobs");

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

//post in job
router.post("/employersLoggedinPage", async (req, res) => {
  console.log(req.body);
  job.db
    .collection("jobs")
    .insertOne({
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
router.get("/employersLoggedinPage", (req, res) => {
  res.render("./employers/employersLoggedinPage");
});

router.get("/employersUpdate", (req, res) => {
  res.render("./employers/employersUpdate");
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
//admin routes
router.get("/admin", (req, res) => {
  if (session) {
    res.render("./admin/adminPage");
  } else {
    res.redirect("./");
  }
});
router.post("/admin", (req, res) => {
  if ("logout-admin" in req.body) {
    req.session.destroy();
    session = req.session;
    res.redirect("./");
  } else if ("newJob-admin" in req.body) {
    console.log("else-newjob");
    job.db
      .collection("jobs")
      .insertOne({
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
            { email: "worksami@gmail.com" },
            { $push: { jobsPosted: newJob.insertedId } }
          );
        res.redirect("/employers/admin");
      })
      .catch((err) => {
        console.log(err.message);
      });
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
