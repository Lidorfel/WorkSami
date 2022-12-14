const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employerSchema = new Schema(
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
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    line_of_business: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    urlcompany: {
      type: String,
      required: true,
    },
    linkedin: {
      type: String,
      required: true,
    },
    isadmin: {
      type: Boolean,
      require: true,
    },
  },
  { timestamps: true }
);

const employer = mongoose.model("employer", employerSchema);
module.exports = employer;
