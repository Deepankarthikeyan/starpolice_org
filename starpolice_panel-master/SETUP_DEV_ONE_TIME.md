# One-time dev environment setup

**Goal:** https://starpoliceacademy-dev.netlify.app uses **dev API + `starpolice_academy_dev`** database.  
**Live** https://starpoliceacademy.in stays on production API + `starpolice_academy`.

I cannot log into your Render/Netlify/Atlas from the agent without your API keys. Follow these steps once (about 15 minutes).

---

## Step 1 — Create dev API on Render (5 min)

1. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect repo `starpolice_org` / `main`.
3. Select blueprint file: **`starpolice_panel-master/render-dev.yaml`**.
4. When asked for **`MONGODB_URI`**, paste your Atlas URI but change the database to **`starpolice_academy_dev`**:
   ```text
   mongodb+srv://USER:PASS@cluster.mongodb.net/starpolice_academy_dev
   ```
   (Same user/password/cluster as live; only the database name changes.)
5. Deploy. Wait until healthy. Note the URL: **`https://starpolice-api-dev.onrender.com`**.

Optional: Render → **starpolice-api-dev** → **Settings** → **Deploy Hook** → copy URL for GitHub secret `RENDER_DEV_DEPLOY_HOOK`.

---

## Step 2 — GitHub secrets (3 min)

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Value |
|--------|--------|
| `MONGODB_URI` | Live Atlas URI (`…/starpolice_academy`) — already may exist |
| `RENDER_API_KEY` | Render → Account Settings → API Keys |
| `RENDER_DEV_SERVICE_ID` | Render → starpolice-api-dev → Settings → Service ID |
| `VITE_API_URL_DEV` | `https://starpolice-api-dev.onrender.com` |
| `NETLIFY_AUTH_TOKEN` | Netlify → User → Applications |
| `NETLIFY_DEV_SITE_ID` | Netlify → starpoliceacademy-dev → Site configuration → General → Site ID |

Optional: `NETLIFY_DEV_BUILD_HOOK`, `RENDER_DEV_DEPLOY_HOOK`.

---

## Step 3 — Run automated setup (2 min)

1. GitHub → **Actions** → **Setup dev environment (Atlas + Render dev + Netlify dev)**.
2. **Run workflow** → branch `main`.

This script will:

- Set `MONGODB_URI` + `CLIENT_URL` on **starpolice-api-dev**
- Set **`VITE_API_URL`** on Netlify dev site and trigger a build
- Seed **demo data** on `starpolice_academy_dev`

---

## Step 4 — Verify

| Check | URL |
|-------|-----|
| Dev login | https://starpoliceacademy-dev.netlify.app/admin/login |
| Dev API health | https://starpolice-api-dev.onrender.com/api/health |
| Live login | https://starpoliceacademy.in/admin/login |

Dev login after seed: `superadmin@starpolice.academy` / `superadmin123`

In DevTools → Network, dev panel API host must be **`starpolice-api-dev.onrender.com`**, not `starpolice-api`.

---

## After setup (daily)

- Test on **dev** → push `main` → **Deploy frontend to Netlify (dev site)** runs for panel changes.
- Live updates from your existing production Netlify + Render deploys.

See [ENVIRONMENTS.md](ENVIRONMENTS.md).
