const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    profession: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      required: true,
    },
    candidates: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("job", jobSchema);
module.exports = Job;
