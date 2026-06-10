// Shared data layer for the wheel + admin pages.
// Uses Firestore (single document) with realtime sync.
// If firebase-config.js still has placeholder values, falls back to
// in-browser "demo mode" so you can test before wiring Firebase up.

import { firebaseConfig } from "./firebase-config.js";

const DEMO = !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("PASTE");

let _update = null;   // function to write state
let _listeners = [];

export const isDemo = () => DEMO;

export function onState(cb) {
  _listeners.push(cb);
}

function emit(state) {
  _listeners.forEach(cb => cb(state));
}

const EMPTY = { names: [], prizes: [], winners: [] };

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
  // fire initial state on next tick so pages have registered listeners
  setTimeout(() => emit(read()), 0);
} else {
  // ---------- Firebase mode ----------
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const { getFirestore, doc, onSnapshot, setDoc, getDoc } =
    await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const ref = doc(db, "draw", "state");

  // create the doc on first run
  const snap = await getDoc(ref);
  if (!snap.exists()) await setDoc(ref, EMPTY);

  onSnapshot(ref, (s) => {
    if (s.exists()) emit({ ...EMPTY, ...s.data() });
  });

  _update = async (newState) => {
    await setDoc(ref, newState);
  };
}

export async function saveState(state) {
  await _update(state);
}
