const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    startdate: {
      type: Date,
      required: true,
    },
    enddate: {
      type: Date,
      required: true,
    },
    avg: {
      type: String,
      required: true,
    },
    findjob: {
      type: Boolean,
      require: true,
    },
    likedJobs: {
      type: Array,
      require: true,
    },
  },
  { timestamps: true }
);

const student = mongoose.model("student", StudentSchema);
module.exports = student;
