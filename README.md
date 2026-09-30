# Student Registration & Portal

Landing page → Google Sign-In → protected student details form → success toast → data saved in MongoDB.

## Structure

```
student-registration/
├── frontend/
│   ├── index.html          Landing page + "Sign in with Google"
│   ├── form.html           Protected student details form + top toast
│   └── firebase-config.js  Your Firebase web app config (fill in)
└── backend/
    ├── server.js            Express app entrypoint
    ├── routes/students.js   POST /api/students, GET /api/students/me
    ├── models/Student.js    Mongoose schema
    ├── middleware/verifyFirebaseToken.js
    ├── package.json
    └── .env.example
```

## 1. Firebase setup (Google Auth)

1. Create a project at https://console.firebase.google.com.
2. **Authentication → Sign-in method → enable Google.**
3. **Project settings → General → Your apps → Add app → Web.** Copy the config
   object into `frontend/firebase-config.js`.
4. **Project settings → Service accounts → Generate new private key.**
   Save the downloaded JSON as `backend/serviceAccountKey.json`
   (or paste its contents into `FIREBASE_SERVICE_ACCOUNT` in `.env`).

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI, PORT, FRONTEND_ORIGIN as needed
npm run dev                # or: npm start
```

Requires a running MongoDB instance (local `mongod`, or a connection string
from MongoDB Atlas in `MONGO_URI`).

## 3. Frontend

No build step — it's static HTML. Serve the `frontend/` folder with any
static server, e.g.:

```bash
cd frontend
npx serve .
# or the VS Code "Live Server" extension
```

Open the served `index.html` in the browser.

## How auth flows

1. User clicks **Sign in with Google** on `index.html` → Firebase opens the
   Google popup → on success, redirect to `form.html`.
2. `form.html` checks `onAuthStateChanged`; if no user, it bounces back to
   `index.html` (protected route).
3. On submit, the frontend gets a fresh Firebase **ID token**
   (`user.getIdToken()`) and sends it as `Authorization: Bearer <token>`
   with the form data to `POST /api/students`.
4. The backend verifies the token with `firebase-admin` (never trusts a
   client-supplied `googleId`/`email`), checks `regNo` is unique, and saves
   the record.
5. On success the backend returns `{ message: "submission was successful" }`,
   and the frontend shows it in a toast pinned to the top of the page that
   auto-dismisses after ~4 seconds.

## Notes / things to adjust for production

- `FRONTEND_ORIGIN` in `.env` should be your deployed frontend URL, not `*`.
- Add HTTPS + a real hosting setup (e.g. Firebase Hosting for frontend,
  Render/Railway/Fly.io for the backend, MongoDB Atlas for the DB).
- The "College ID Card" field currently accepts a **number/text ID**, not a
  file upload — wiring up real file uploads (e.g. to Firebase Storage or S3)
  is a natural next step if you need the actual card image.
