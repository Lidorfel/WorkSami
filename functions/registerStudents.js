const cons = require("consolidate");

const db = require("../app").db;
function register(object) {
  let success = false;
  console.log(object);
  db.collection("students")
    .insertOne({
      fullname: object.fullname,
      id: object.userId,
      phone: object.phone_user,
      email: object.email_user,
      password: object.password,
      gender: object.gender_select,
      status: object.study_year,
      department: object.study_profession,
      startdate: object.strat_date,
      enddate: object.finish_date,
      avg: object.avrage_grade,
    })
    .then(() => {
      console.log("test1");
      success = true;
      return 1;
    })
    .catch((err) => {
      console.log("test2");
      return 2;
    });
}
module.exports = register;
// console.log(req.body);
// db.collection("students")
//   .insertOne({
//     fullname: req.body.fullname,
//     id: req.body.userId,
//     phone: req.body.phone_user,
//     email: req.body.email_user,
//     password: req.body.password,
//     gender: req.body.gender_select,
//     status: req.body.study_year,
//     department: req.body.study_profession,
//     startdate: req.body.strat_date,
//     enddate: req.body.finish_date,
//     avg: req.body.avrage_grade,
//   })
//   .then(() => {
//     res.redirect("/loginSt");
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });
