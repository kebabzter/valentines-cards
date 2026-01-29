# Deploying Valentine's Cards

This app stores cards in a **JSON file** (`data/cards.json`) and uses **in-memory rate limiting**. That works on hosts with a **persistent filesystem** (e.g. Railway, Render). On **Vercel** (serverless), the filesystem is read-only and ephemeral, so cards would not persist unless you switch to a database.

---

## Option A: Railway (works as-is, recommended)

Railway runs your app with a writable filesystem, so the current setup works without code changes.

1. **Push your code to GitHub** (if you haven’t already):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/valentines-cards.git
   git push -u origin main
   ```

2. **Sign up / log in** at [railway.app](https://railway.app).

3. **New project from GitHub**  
   Dashboard → **New Project** → **Deploy from GitHub repo** → choose `valentines-cards`.

4. **Configure the service**  
   Railway usually detects Next.js. If needed:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
   - **Root directory:** leave blank (repo root).

5. **Set environment variables**  
   In the service → **Variables**:
   - `PREVIEW_TOKEN` = a long random string (e.g. from `openssl rand -hex 24`).

6. **Deploy**  
   Railway builds and deploys. Use the generated URL (or add a custom domain).

7. **Persistent data**  
   By default, `data/` is writable. For long-term reliability you can add a **Volume** and point your app at it later; for a small Valentine’s project, the default disk is often enough.

---

## Option B: Render (works as-is)

Render also gives your app a writable filesystem.

1. **Push code to GitHub** (see Option A step 1).

2. **Sign up** at [render.com](https://render.com).

3. **New Web Service**  
   Dashboard → **New** → **Web Service** → connect your GitHub repo `valentines-cards`.

4. **Settings:**
   - **Runtime:** Node
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Instance type:** Free (or paid for always-on).

5. **Environment**  
   Add variable:
   - `PREVIEW_TOKEN` = your secret token.

6. **Create Web Service**  
   Render builds and deploys. Your app URL will be something like `https://valentines-cards-xxxx.onrender.com`.

**Note:** On the free tier the app may sleep; the first request after idle can be slow. Paid plans keep it always on.

---

## Option C: Vercel (requires a database)

Vercel is great for Next.js but **does not persist files** between requests. To deploy here you need to **replace the JSON file with a database** (e.g. Supabase, Turso, or Vercel Postgres) and optionally move rate limiting to the DB or an external store. Until that’s done, **use Option A or B** so cards and rate limits work as designed.

If you later migrate to Supabase (or similar):

1. Create a project and a `cards` table.
2. Swap `src/lib/cardsStore.ts` to use the database client instead of the filesystem.
3. Deploy on Vercel and set `PREVIEW_TOKEN` (and DB URL) in **Project → Settings → Environment Variables**.

---

## After deployment

- **Form:** `https://your-app-url.com/`
- **Wall (after unlock):** `https://your-app-url.com/cards`
- **Developer preview:** `https://your-app-url.com/preview` (use `PREVIEW_TOKEN` when prompted).

Always set `PREVIEW_TOKEN` in the host’s environment (never commit it). Use the same token in the preview page to load cards before the public unlock.
