const express = require("express");
const router = express.Router();
const student = require("../../models/Students");
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
  res.render("./students/StudentLogin");
});
//router for loginstudnt

router.post("/loginSt", async (req, res) => {
  student
    .findOne({ email: req.body.email })
    .then((user) => {
      if (user.password === req.body.password) {
        res.redirect(`/students/${user._id}`);
      } else {
        res.redirect("/404");
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  res.render("./students/studentsPage", { id: id });
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
