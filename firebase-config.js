// ============================================================
// PASTE YOUR FIREBASE CONFIG HERE
// Firebase Console > Project settings > Your apps > Web app
// ============================================================
export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

// Simple PIN for the admin page (basic deterrence only, not real security —
// anyone determined could bypass it. Keep the admin URL to yourself.)
export const ADMIN_PIN = "1234";

// Shown in the header banner
export const MILESTONE_TEXT = "1 YEAR · ZERO LOST TIME ACCIDENTS";
export const SITE_NAME = ""; // e.g. "GXO Manchester" — optional
