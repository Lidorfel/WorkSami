const express = require("express");
const cookieParser = require("../../app").cookieParser;
const sessions = require("../../app").sessions;
const router = express.Router();
const student = require("../../models/Students");
const job = require("../../models/jobs");
const cons = require("consolidate");
const { default: mongoose } = require("mongoose");
let session;

// var db = require("../../app");
// const User = require("../../models/User");
//students
router.get("/", (req, res) => {
  res.render("./students/studentsPage");
});
//contact page
router.get("/contact", (req, res) => {
  res.render("./students/contactPageST");
});
//students register page
router.get("/registerSt", (req, res) => {
  res.render("./students/StudentRegister");
});
//student
//students login
router.get("/loginSt", (req, res) => {
  res.render("./students/studentLogin");
});
router.post("/loginSt", async (req, res) => {
  try {
    student
      .findOne({ email: req.body.email })
      .then((user) => {
        if (user.password === req.body.password) {
          session = req.session;
          session.userid = req.body.email;
          console.log(session);
          res.redirect("/students/studentMainPage");
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
      res.sendStatus("/404");
    };
  }
});
//router for update
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
router.get("/studentMainPage", (req, res) => {
  // const id = req.params.id;
  let li = [];
  const jobsRef = job.db.collection("jobs");
  student.findOne({ email: session.userid }).then((user) => {
    jobsRef.find().toArray((err, jobsArray) => {
      jobsArray.forEach((job) => {
        if (job.approved) {
          li.push(job);
        }
      });
      if (session) {
        res.render("./students/studentMainPage", {
          jobsArray: li,
          likedJobs: user.likedJobs,
          studentEmail: session.userid,
        });
      } else {
        res.redirect("./");
      }
    });
  });
});
router.post("/registerSt", async (req, res) => {
  student.db
    .collection("students")
    .insertOne({
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
    })
    .then(() => {
      console.log("user created");
    })
    .catch((err) => {
      console.log(err.message);
    });
  res.redirect("/students/loginSt");
});

router.post("/studentMainPage/likejob/:id", (req, res) => {
  console.log("like", req.params.id);
  const id = req.params.id;
  student.db
    .collection("students")
    .updateOne({ email: session.userid }, { $push: { likedJobs: id } });
  res.redirect("/students/studentMainPage");
});
router.post("/studentMainPage/unlikejob/:id", (req, res) => {
  console.log("unlike");
  const id = req.params.id;
  student.db
    .collection("students")
    .updateOne({ email: session.userid }, { $pull: { likedJobs: id } });
  res.redirect("/students/studentMainPage");
});
router.post("/studentMainPage/applyToJob/:id", (req, res) => {
  const jobid = req.params.id;
  console.log("test1", jobid);
  job.findById(jobid).then((jobFound) => {
    job.db
      .collection("jobs")
      .updateOne(
        { UniqueID: jobFound.UniqueID },
        { $push: { candidates: session.userid } }
      );
    res.redirect("/students/studentMainPage");
  });
});
router.post("/studentMainPage/afterFilterJob/", (req, res) => {
  if (session) {
    const companyName = req.body.name_job;
    const type = req.body.job_type;
    const location = req.body.location;
    let flag1 = 0;
    let flag2 = 0;
    let li = [];
    student.db
      .collection("students")
      .findOne({ email: session.userid })
      .then((user) => {
        const jobRef = job.db.collection("jobs");
        jobRef.find().toArray((err, jobArr) => {
          const filterArray = (array, filter1, filter2, filter3) => {
            return array.filter((item) => {
              // If all three filters are null, include the item in the result
              if (!filter1 && !filter2 && !filter3) {
                return true;
              }

              // If any of the filters is not null, include the item in the result
              // only if it meets the criteria of the non-null filters
              else {
                return (
                  (filter1 ? item.companyName === filter1 : true) &&
                  (filter2 ? item.profession === filter2 : true) &&
                  (filter3 ? item.location === filter3 : true)
                );
              }
            });
          };
          li = filterArray(jobArr, companyName, type, location);
          newLi = li.filter((item) => {
            return item.approved === true;
          });
          res.render("./students/studentMainPage", {
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
router.post("/logout", (req, res) => {
  req.session.destroy();
  session = req.session;

  res.redirect("./");
});
//student update

router.post("/studentsUpdate", (req, res) => {
  console.log(session.userid);
  const updObj = {};
  if (req.body.new_password) {
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
      $set: updObj,
    }
  );

  res.redirect("/students/studentsUpdate");
});

//post method
// router.route("/registerSt").post(async (req, res) => {
//   console.log(req.body);
//   User.create({
//     fullname: req.body.fullname,
//     id: req.body.userId,
//     phone: req.body.phone_user,
//     email: req.body.email,
//     password: req.body.password,
//     gender: req.body.gender_select,
//     status: req.body.study_year,
//     department: req.body.department,
//     startdate: req.body.strat_date,
//     enddate: req.body.finish_date,
//     avg: req.body.avrage_grade,
//   })
//     .then(() => {
//       console.log("user created");
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
//   res.redirect("./loginSt");
// });

module.exports = router;
