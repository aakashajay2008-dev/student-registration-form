require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

// ── JSON file database (zero-install, no MongoDB needed) ──────────────────
const dbPath = path.join(__dirname, "db.json");
const adapter = new FileSync(dbPath);
const db = low(adapter);
db.defaults({ students: [] }).write();

// ── Firebase Admin (skipped in DEMO_MODE) ─────────────────────────────────
if (process.env.DEMO_MODE !== "true") {
  const admin = require("firebase-admin");
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    try { serviceAccount = require("./serviceAccountKey.json"); } catch {}
  }
  if (serviceAccount) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
} else {
  console.log("🎭 DEMO MODE — Firebase token verification bypassed.");
}

// ── Express app ───────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json());

// Attach db to every request
app.use((req, _res, next) => { req.db = db; next(); });

// Serve frontend static files
const frontendDir = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendDir));

app.get("/health", (_req, res) =>
  res.json({ status: "ok", demo: process.env.DEMO_MODE === "true", db: "lowdb/json" })
);

// ── Student routes (inline, no mongoose) ─────────────────────────────────
const verifyFirebaseToken = require("./middleware/verifyFirebaseToken");

// POST /api/students
app.post("/api/students", verifyFirebaseToken, (req, res) => {
  const { studentName, collegeName, regNo, collegeId } = req.body;
  if (!studentName || !collegeName || !regNo || !collegeId) {
    return res.status(400).json({ message: "All fields are required." });
  }
  const existing = db.get("students").find({ regNo: regNo.trim() }).value();
  if (existing) {
    return res.status(409).json({ message: "This registration number has already been submitted." });
  }
  const student = {
    id: Date.now().toString(),
    googleId: req.user.uid,
    email: req.user.email,
    studentName: studentName.trim(),
    collegeName: collegeName.trim(),
    regNo: regNo.trim(),
    collegeId: collegeId.trim(),
    createdAt: new Date().toISOString(),
  };
  db.get("students").push(student).write();
  return res.status(201).json({ message: "submission was successful", student });
});

// GET /api/students/me
app.get("/api/students/me", verifyFirebaseToken, (req, res) => {
  const student = db.get("students").find({ googleId: req.user.uid }).value() || null;
  return res.json({ student });
});

// GET /api/students  (admin — all records)
app.get("/api/students", (_req, res) => {
  const students = db.get("students").value();
  return res.json({ students, total: students.length });
});

// 404 for unknown API routes
app.use("/api", (_req, res) => res.status(404).json({ message: "Not found" }));

// SPA fallback
app.get("*", (_req, res) => res.sendFile(path.join(frontendDir, "index.html")));

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Database  → ${dbPath}`);
  console.log(`🚀 Server    → http://localhost:${PORT}`);
  console.log(`📄 Open this → http://localhost:${PORT}`);
});
