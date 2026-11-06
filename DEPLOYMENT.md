# Deploying PlacePrep AI to Render & UptimeRobot

## Part 1: Can You Use Ollama Online?

**The Honest Technical Answer:**
- **Inside Render Free Tier? NO.** Render's free tier gives only **512 MB of RAM**. Loading even a small 2-billion parameter model like `gemma2:2b` requires at least **2.5 GB to 4 GB of RAM**, which will cause an instant Out-Of-Memory (OOM) crash on Render.
- **Can you connect Render to Ollama online? YES, in 2 ways:**
  
### Option A: Tunnel Your Local Ollama Online (100% Free)
You can expose your laptop's running Ollama instance to the internet using **Cloudflare Tunnel** or **Ngrok**:
```bash
# Using Cloudflare Tunnel (no account required):
npx cloudflared tunnel --url http://localhost:11434

# OR using Ngrok:
ngrok http 11434
```
It gives you a public HTTPS URL like `https://funny-random-subdomain.trycloudflare.com`.
In Render's Environment Variables, set:
```env
OLLAMA_HOST=https://funny-random-subdomain.trycloudflare.com
```
Now Render forwards all AI requests directly to your laptop's Ollama instance!

### Option B: Use Groq API for Blazing Fast (0.2s) Responses (Recommended for Cloud)
Ollama running on CPU locally causes a 5–15 second latency delay. In `src/lib/gemini.ts`, we added native support for **Groq**:
1. Get a free API key at [console.groq.com](https://console.groq.com) (no credit card required).
2. Set `GROQ_API_KEY="gsk_..."` in `.env` or Render environment variables.
3. Groq runs LPU hardware delivering **500+ tokens/sec (sub-second responses)** with zero local CPU load!

---

## Part 2: Deploying to Render.com

### Step 1: Push Project to GitHub
```bash
git init
git add .
git commit -m "Initial PlacePrep AI release"
git branch -M main
git remote add origin https://github.com/ShivaGanesh1080-ops/placement-portal.git
git push -u origin main
```

### Step 2: Create a Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the build & start settings:
   - **Name:** `placeprep-ai`
   - **Environment:** `Node`
   - **Region:** Singapore / Oregon / Frankfurt
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm install --legacy-peer-deps && npx prisma db push && node prisma/seed.ts && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start
     ```
   - **Plan:** Free

### Step 3: Set Environment Variables in Render
Under **Environment Variables**, add:
- `NEXTAUTH_SECRET`: Any random 32-character string (e.g. `c84a8b79e13d9f2e718290f6b7c89a0d`)
- `NEXTAUTH_URL`: Your Render URL (e.g. `https://placeprep-ai.onrender.com`)
- `DATABASE_URL`: `file:./dev.db` *(or a free PostgreSQL connection string from Supabase/Neon)*
- `GROQ_API_KEY`: *(Optional, for sub-second responses)*
- `OLLAMA_HOST`: Your Cloudflare Tunnel URL or `http://127.0.0.1:11434`

---

## Part 3: Keeping Render Awake with UptimeRobot (Prevent 15-Min Sleep)

Render's free tier spins down to sleep if there are no incoming requests for 15 minutes. Cold starts take ~50 seconds. To prevent this:

1. Sign up for free at **[UptimeRobot.com](https://uptimerobot.com)**.
2. Click **+ Add New Monitor**.
3. Configure the monitor:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `PlacePrep AI Keepalive`
   - **URL (or IP):** `https://your-app-name.onrender.com/api/health`
   - **Monitoring Interval:** Every `5 minutes` (or `10 minutes`)
4. Click **Create Monitor**.

UptimeRobot will ping `/api/health` every 5 minutes. Because the interval is less than Render's 15-minute inactivity threshold, **your Render instance will stay awake 24/7 with zero cold starts**!
