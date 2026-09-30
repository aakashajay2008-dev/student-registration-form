// frontend/firebase-config.js
//
// 1. Go to https://console.firebase.google.com -> Create/select a project.
// 2. Project settings -> General -> "Your apps" -> Add a Web app.
// 3. Copy the config object it gives you and paste the values below.
// 4. Authentication -> Sign-in method -> enable "Google".
//
// This file is safe to expose in the browser — these are public client keys,
// not secrets. Access control is enforced by Firebase security rules /
// your backend verifying the ID token, not by hiding this config.

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Base URL of your backend API (change for production)
export const API_BASE_URL = "http://localhost:4000";
