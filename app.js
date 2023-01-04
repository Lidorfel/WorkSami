const express = require("express");
const path = require("path");
const cons = require("consolidate");
const { join } = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const studentRoutes = require("./routes/students/studentsRoutes");
const employerRoutes = require("./routes/employers/employersRoutes");
const { object } = require("webidl-conversions");
const { ObjectID } = require("bson");
const { findById } = require("./models/Students");
const student = require("./models/Students");
const request = require("./models/request");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const app = express();
const dbURI =
  "mongodb+srv://bugab:test1234@worksami.1vddn1h.mongodb.net/WorkSamiweb?retryWrites=true&w=majority";
let db = mongoose.connection;
let session;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    app.listen(3000);
    console.log("connected to db + listing to port 3000");
  })
  .catch((err) => console.log(err));

// app.engine("html", cons.swig);
// app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.json);
app.use(bodyParser.urlencoded({ extended: true }));
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(
  sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.get("/", (req, res) => {
  let numJobs = 0;
  let numUsers = 0;
  let numFoundJob = 0;
  const jobRef = db.collection("jobs");
  jobRef.find().toArray((err, jobs) => {
    jobs.forEach((job) => {
      if (job.approved) {
        numJobs++;
      }
    });
    const studentRef = db.collection("students");
    studentRef.find().toArray((err, students) => {
      numUsers = students.length;
      students.forEach((stu) => {
        if (stu.findjob) {
          numFoundJob++;
        }
      });
      res.render("mainPage", {
        numJobs: numJobs,
        numFoundJob: numFoundJob,
        numUsers: numUsers,
      });
    });
  });
});
app.get("/contact", (req, res) => {
  res.render("contactPage");
});
app.post("/contact", (req, res) => {
  console.log(req.body);
  if (
    req.body.contact_body_text.length > 0 &&
    req.body.person_email.length > 0 &&
    req.body.person_phone.length > 0 &&
    req.body.person_fullname.length > 0
  ) {
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
        res.redirect("/");
      })
      .catch((err) => {
        console.log("request failed " + err);
      });
  } else {
    res.redirect("/contact");
  }
});
app.use("/employers", employerRoutes);
app.use("/students", studentRoutes);
// app.use("/admin", adminRoutes);
app.use((req, res) => {
  res.statusCode = 404;
  res.render("404");
});
mongoose.set("strictQuery", true);

module.exports = { db, app, sessions, cookieParser };
