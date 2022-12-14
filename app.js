const express = require("express");
const path = require("path");
const cons = require("consolidate");
const { join } = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const studentRoutes = require("./routes/students/studentsRoutes");
const employerRoutes = require("./routes/employers/employersRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const app = express();
const dbURI =
  "mongodb+srv://bugab:test1234@worksami.1vddn1h.mongodb.net/WorkSamiweb?retryWrites=true&w=majority";
var db = mongoose.connection;
mongoose.set("strictQuery", false);
const studentRegister = require("./functions/registerStudents");
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    app.listen(3000);
    console.log("connected to db + listing to port 3000");
  })
  .catch((err) => console.log(err));

app.engine("html", cons.swig);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.use(express.static(path.join(__dirname, "public")));
// app.use(bodyParser.json);
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("mainPage");
});
app.get("/contact", (req, res) => {
  res.render("contactPage");
});
//register for students
app.post("/students/registerSt", async (req, res) => {
  console.log(req.body);
  db.collection("students")
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
      res.redirect("/loginSt");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//register for employers
app.post("/employers/registerEm", async (req, res) => {
  db.collection("employers")
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
      res.send("user created");
    })
    .catch((err) => {
      console.log(err.message);
    });
  res.redirect("/employers/loginEm");
});
app.use("/employers", employerRoutes);
app.use("/students", studentRoutes);
app.use("/admin", adminRoutes);
app.use((req, res) => {
  res.statusCode = 404;
  res.render("404");
});
mongoose.set("strictQuery", true);
module.exports = app;
