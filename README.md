# GXO Safety Milestone Prize Draw 🎡

A spin-the-wheel prize draw for celebrating **1 year with zero lost time accidents**.

- **index.html** — the wheel page you show on the big screen. Spin it, the wheel lands on a winner, and a popup shows their name + prize + prize photo with confetti. Winners and prizes are automatically removed so nobody (and no prize) can be drawn twice.
- **admin.html** — where you manage everything: add names (bulk paste supported), add prizes with photos, reorder prizes, see/export the winners list, and reset. Prizes are drawn **from the bottom of the list upwards**, so put the star prize at the top.
- Data lives in **Firebase Firestore**, so the wheel and admin pages stay in sync in real time — you can run admin on your phone and the wheel on a projector.

Until Firebase is connected, the site runs in **demo mode** (yellow banner, nothing saved) so you can try it locally first.

---

## 1. Set up Firebase (~5 minutes)

1. Go to https://console.firebase.google.com and **Add project** (call it anything, e.g. `gxo-prize-draw`). You can disable Google Analytics.
2. In the left menu: **Build → Firestore Database → Create database**. Choose a region near you (e.g. `europe-west2` for the UK) and start in **production mode**.
3. Go to the **Rules** tab and replace the rules with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /draw/state {
         allow read, write: if true;
       }
     }
   }
   ```

   Click **Publish**.

   > ⚠️ These rules let anyone with the URL read/write the draw data. That's usually fine for a one-day internal event — just don't share the link outside work, and consider deleting the Firebase project afterwards. If you want it locked down properly, you'd add Firebase Authentication later.

4. Click the **gear icon → Project settings → Your apps → Web (</>) icon**. Register an app (no hosting needed). Firebase shows you a `firebaseConfig` object.
5. Open **`firebase-config.js`** in this folder and paste your values over the `PASTE_...` placeholders.
6. While you're in that file, change **`ADMIN_PIN`** from `1234` to something else, and set `SITE_NAME` if you want (e.g. `"GXO Manchester"`).

## 2. Put it on GitHub

1. Create a new repository at https://github.com/new (it can be private — Vercel works with private repos).
2. Upload all the files in this folder (`index.html`, `admin.html`, `style.css`, `store.js`, `firebase-config.js`, `README.md`). The easiest way with no git knowledge: on the empty repo page click **"uploading an existing file"** and drag them all in.

## 3. Deploy on Vercel

1. Go to https://vercel.com, sign in with GitHub.
2. **Add New → Project**, import your repo.
3. Framework preset: **Other**. No build command, no output directory — it's plain static files. Click **Deploy**.
4. You'll get a URL like `https://gxo-prize-draw.vercel.app`:
   - Wheel: `https://your-app.vercel.app/`
   - Admin: `https://your-app.vercel.app/admin.html`

Any time you edit a file in GitHub, Vercel redeploys automatically.

## Notes & limits

- Prize photos are resized in the browser and stored inside the Firestore document. Firestore documents max out at 1MB, which comfortably fits **roughly 20–25 prizes with photos**. If you need lots more, remove photos from some prizes.
- The admin PIN is a simple front-door deterrent, not real security — anyone technical could bypass it. Keep the admin URL private.
- The winners list can be downloaded as a CSV from the admin page — handy for HR/comms after the event.
- To use your official GXO logo instead of the text wordmark, add your logo file to the repo and swap it in where marked in `index.html` / `admin.html` (there's a comment showing exactly where).

Good luck with the draw — and congratulations on the year! 🟢
