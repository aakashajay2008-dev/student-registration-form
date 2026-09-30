const express = require("express");
const Student = require("../models/Student");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");

const router = express.Router();

/**
 * POST /api/students
 * Protected route — requires a valid Firebase ID token.
 * Body: { studentName, collegeName, regNo, collegeId }
 */
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { studentName, collegeName, regNo, collegeId } = req.body;

    if (!studentName || !collegeName || !regNo || !collegeId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await Student.findOne({ regNo: regNo.trim() });
    if (existing) {
      return res.status(409).json({ message: "This registration number has already been submitted." });
    }

    const student = await Student.create({
      googleId: req.user.uid,
      email: req.user.email,
      studentName: studentName.trim(),
      collegeName: collegeName.trim(),
      regNo: regNo.trim(),
      collegeId: collegeId.trim(),
    });

    return res.status(201).json({
      message: "submission was successful",
      student,
    });
  } catch (err) {
    console.error("Error creating student record:", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
});

/**
 * GET /api/students/me
 * Protected route — returns the signed-in user's own submission, if any.
 */
router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const student = await Student.findOne({ googleId: req.user.uid });
    return res.json({ student: student || null });
  } catch (err) {
    console.error("Error fetching student record:", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
