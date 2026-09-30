const admin = require("firebase-admin");

/**
 * Verifies the Firebase ID token sent by the frontend in the
 * `Authorization: Bearer <token>` header. On success, attaches the
 * decoded user (uid, email, name, picture) to req.user.
 *
 * In DEMO_MODE=true the token is treated as a JSON payload
 * (base64-encoded or plain JSON) so the app works without Firebase credentials.
 *
 * We NEVER trust a googleId/email sent in the request body — they're
 * always taken from the verified token instead, so a client can't spoof
 * another user's identity.
 */
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing or invalid Authorization header." });
  }

  // ── DEMO MODE (no Firebase service account needed) ──────────────────────────
  if (process.env.DEMO_MODE === "true") {
    try {
      const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
      req.user = {
        uid: payload.uid || payload.email || "demo-user",
        email: payload.email || "demo@example.com",
        name: payload.name || "Demo User",
        picture: payload.picture || "",
      };
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid demo token." });
    }
  }

  // ── PRODUCTION: verify with Firebase Admin ───────────────────────────────────
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token. Please sign in again." });
  }
}

module.exports = verifyFirebaseToken;
