// Shared data layer for the wheel + admin pages.
// Uses Firestore (single document) with realtime sync.
// If firebase-config.js still has placeholder values, falls back to
// "demo mode" (saved in this browser only) so you can test first.
//
// Any Firebase problem is captured and reported via getInitError()/onError()
// instead of crashing the page.

import { firebaseConfig } from "./firebase-config.js";

const DEMO = !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("PASTE");

let _update = null;
let _listeners = [];
let _errListeners = [];
let _initError = null;

export const isDemo = () => DEMO;
export const getInitError = () => _initError;
export function onState(cb){ _listeners.push(cb); }
export function onError(cb){ _errListeners.push(cb); if (_initError) cb(_initError); }

function emit(state){ _listeners.forEach(cb => cb(state)); }
function fail(err){
  console.error("[prize-draw] Firebase error:", err);
  _initError = err;
  _errListeners.forEach(cb => cb(err));
}

const EMPTY = { names: [], prizes: [], winners: [] };

function friendly(e){
  const msg = String(e && (e.code || e.message) || e);
  if (msg.includes("permission-denied"))
    return new Error("Firebase says permission denied. In the Firebase console go to Build → Firestore Database → Rules and publish the rules from the README.");
  if (msg.includes("not-found") || msg.includes("does not exist") || msg.includes("NOT_FOUND"))
    return new Error("Firestore database not found. In the Firebase console go to Build → Firestore Database and click Create database (this is different from Realtime Database).");
  if (msg.includes("api-key") || msg.includes("invalid-api"))
    return new Error("Firebase rejected the API key — re-copy your config values into firebase-config.js.");
  return new Error("Firebase error: " + msg);
}

if (DEMO) {
  // ---------- demo mode: saved in this browser only (localStorage) ----------
  const KEY = "gxo-draw-demo";
  const read = () => {
    try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
    catch { return structuredClone(EMPTY); }
  };
  _update = async (newState) => {
    localStorage.setItem(KEY, JSON.stringify(newState));
    emit(read());
  };
  // sync across tabs (admin in one tab, wheel in another)
  window.addEventListener("storage", (e) => { if (e.key === KEY) emit(read()); });
  setTimeout(() => emit(read()), 0);
} else {
  // ---------- Firebase mode ----------
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { getFirestore, doc, onSnapshot, setDoc, getDoc } =
      await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const ref = doc(db, "draw", "state");

    // create the doc on first run
    const snap = await getDoc(ref);
    if (!snap.exists()) await setDoc(ref, EMPTY);

    onSnapshot(ref,
      (s) => { if (s.exists()) emit({ ...EMPTY, ...s.data() }); },
      (err) => fail(friendly(err))
    );

    _update = async (newState) => {
      try { await setDoc(ref, newState); }
      catch (err) { const f = friendly(err); fail(f); throw f; }
    };
  } catch (err) {
    fail(friendly(err));
    _update = async () => { throw _initError; };
  }
}

export async function saveState(state){ await _update(state); }
