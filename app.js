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

app.engine("html", cons.swig);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
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
  res.render("mainPage");
});
app.get("/contact", (req, res) => {
  res.render("contactPage");
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
