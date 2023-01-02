const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    reqBody: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("request", requestSchema);
module.exports = Request;
