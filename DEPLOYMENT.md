# Deploying PlacePrep AI to Render & UptimeRobot (Zero-Downtime Guide)

This guide walks you through deploying **PlacePrep AI** to [Render](https://render.com) for free, along with keeping it awake 24/7 using **UptimeRobot**.

---

## 1. Repository Information
- **GitHub Repository:** [`https://github.com/ShivaGanesh1080-ops/PlacePrep-AI`](https://github.com/ShivaGanesh1080-ops/PlacePrep-AI)
- **Branch:** `main`

---

## 2. Deploying on Render (Two Options)

### Option A: Using Render Blueprints (`render.yaml` — 1-Click Automated)
The repository contains a pre-configured `render.yaml` file.
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Select your GitHub repository: `ShivaGanesh1080-ops/PlacePrep-AI`.
4. Render will parse `render.yaml` and configure the Web Service automatically.
5. In the Environment Variables screen, fill in:
   - `NEXTAUTH_URL`: `https://<your-service-name>.onrender.com`
   - `CLOUDFLARE_ACCOUNT_ID`: *(From your Cloudflare Dashboard)*
   - `CLOUDFLARE_API_TOKEN`: *(From your Cloudflare Dashboard)*
6. Click **Apply**.

---

### Option B: Manual Web Service Setup (Step-by-Step)
If you prefer setting it up manually:
1. Go to [dashboard.render.com](https://dashboard.render.com) → click **New +** → **Web Service**.
2. Select **Build and deploy from a Git repository** and connect `ShivaGanesh1080-ops/PlacePrep-AI`.
3. Configure the settings:
   - **Name:** `placeprep-ai` *(or your preferred URL prefix)*
   - **Region:** `Singapore` *(fastest for India)* or `Oregon (US West)`
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npx prisma db push && node prisma/seed.js && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start
     ```
   - **Instance Type:** `Free` (512 MB RAM / 0.1 CPU)

4. **Environment Variables:**
   Under **Environment Variables**, add the following keys:
   | Key | Value / Note |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `file:./dev.db` |
   | `NEXTAUTH_SECRET` | Click **Generate** or enter a 32+ character string |
   | `NEXTAUTH_URL` | `https://placeprep-ai.onrender.com` *(match your Render URL)* |
   | `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |
   | `CLOUDFLARE_API_TOKEN` | Your Cloudflare Workers AI API Token |
   | `GEMINI_API_KEY` | *(Optional fallback)* |

5. Click **Create Web Service**.

---

## 3. Post-Deployment Verification
Once Render finishes deploying:
1. Visit `https://<your-app-name>.onrender.com`.
2. Test signing up a new account or logging in with student credentials:
   - **Email:** `shiva@student.com` | **Password:** `student123`
   - **Admin:** `admin@placeprep.ai` | **Password:** `admin123`
3. Verify that `/api/health` returns:
   ```json
   {"status":"ok","timestamp":"2026-..."}
   ```

---

## 4. Preventing Cold Boots (24/7 Free Uptime with UptimeRobot)

Render's free tier spins down (sleeps) if there are no incoming requests for 15 minutes. The next visitor experiences a 50-second cold boot delay.

To keep it **awake 24/7 without paying anything**:
1. Sign up for a free account at [UptimeRobot.com](https://uptimerobot.com).
2. Click **+ Add New Monitor**.
3. Fill in the details:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `PlacePrep AI Keepalive`
   - **URL (or IP):** `https://<your-service-name>.onrender.com/api/health`
   - **Monitoring Interval:** Every `5 minutes`
4. Click **Create Monitor**.

Because UptimeRobot pings `/api/health` every 5 minutes (well below the 15-minute inactivity limit), **Render will never spin down and your app will load instantly for students and recruiters!**
