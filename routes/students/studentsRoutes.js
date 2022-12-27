const express = require("express");
const cookieParser = require("../../app").cookieParser;
const sessions = require("../../app").sessions;
const router = express.Router();
const student = require("../../models/Students");
let session;

// var db = require("../../app");
// const User = require("../../models/User");
//students
router.get("/", (req, res) => {
  res.render("./students/studentsPage");
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
//router for update
router.get("/studentsUpdate", (req, res) => {
  // const id = req.params.id;
  if (session) {
    res.render("./students/studentsUpdate");
  } else {
    res.redirect("./");
  }
});
router.get("/studentMainPage", (req, res) => {
  // const id = req.params.id;
  if (session) {
    res.render("./students/studentMainPage");
  } else {
    res.redirect("./");
  }
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
    })
    .then(() => {
      console.log("user created");
    })
    .catch((err) => {
      console.log(err.message);
    });
  res.redirect("/students/loginSt");
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
