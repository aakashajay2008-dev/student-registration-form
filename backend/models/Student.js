const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const studentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(),
    unique: true,
  },
  googleId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  collegeName: {
    type: String,
    required: true,
    trim: true,
  },
  regNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  collegeId: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Student", studentSchema);
