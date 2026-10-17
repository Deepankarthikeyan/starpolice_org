# One-time dev environment setup

**Goal:** https://starpoliceacademy-dev.netlify.app uses **dev API + `starpolice_academy_dev`** database.  
**Live** https://starpoliceacademy.in stays on production API + `starpolice_academy`.

I cannot log into your Render/Netlify/Atlas from the agent without your API keys. Follow these steps once (about 15 minutes).

---

## If Render does not show `starpolice_org`

The GitHub repo is **`Deepankarthikeyan/starpolice_org`** (public, branch **`main`**).

1. Log into Render with the **same GitHub account** that owns the repo (`Deepankarthikeyan`).
2. Open **[GitHub → Settings → Applications → Render](https://github.com/settings/installations)** → **Configure**.
3. Under **Repository access**, choose **Only select repositories** → add **`starpolice_org`** → **Save**.
4. In Render: **Account Settings** → **GitHub** → **Reconnect** if needed.
5. Try again: **New** → **Web Service** (or Blueprint) → search **`starpolice`** or **`starpolice_org`**.

Still missing? Use **Manual Web Service** below (no Blueprint required).

---

## Step 1 — Create dev API on Render (5 min)

### Option A — Blueprint

1. [Render → New Blueprint](https://dashboard.render.com/select-repo?type=blueprint).
2. Repo: **`Deepankarthikeyan/starpolice_org`**, branch **`main`**.
3. Blueprint file at repo root: **`render-dev.yaml`** (not inside a subfolder).

### Option B — Manual Web Service (use this if repo list is empty)

1. [Render → New → Web Service](https://dashboard.render.com/create?type=web).
2. Connect GitHub → select **`Deepankarthikeyan/starpolice_org`**.
3. Settings:

   | Field | Value |
   |-------|--------|
   | **Name** | `starpolice-api-dev` |
   | **Region** | same as live API |
   | **Branch** | `main` |
   | **Root Directory** | `starpolice_panel-master/server` |
   | **Runtime** | **Docker** |
   | **Instance type** | Free |

4. **Environment variables** (before or after first deploy):

   | Key | Value |
   |-----|--------|
   | `CLIENT_URL` | `https://starpoliceacademy-dev.netlify.app` |
   | `MONGODB_URI` | Atlas URI ending with `/starpolice_academy_dev` |
   | `JWT_SECRET` | long random string (different from live) |
   | `RESEND_API_KEY` | optional, copy from live if you need email on dev |

5. **Create Web Service** → wait until **Live**.

### Option A continued (Blueprint)
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

Dev super admin (recommended): `spademo@gmail.com` / `spa123` — set once on **starpolice-api-dev** Shell:

**Render Shell is paid** — use one of these free options:

### Option A — GitHub Actions (recommended)

1. GitHub → repo **starpolice_org** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `MONGODB_URI_DEV`
   - Value: your Atlas URI with database **`starpolice_academy_dev`** (same user/password as Atlas; encode `@` in password as `%40`).
2. **Actions** → **Set dev super admin login** → **Run workflow**
   - Email: `spademo@gmail.com`
   - Password: `spa123`
3. When the job is green, log in on dev.

### Option B — Your PC (Node.js)

```bash
cd starpolice_panel-master/server
npm ci
export MONGODB_URI='mongodb+srv://...@deepan.wmec4vz.mongodb.net/starpolice_academy_dev?retryWrites=true&w=majority'
SUPERADMIN_EMAIL=spademo@gmail.com SUPERADMIN_PASSWORD=spa123 npm run set-superadmin
```

**Until this runs**, dev login shows **Invalid credentials** for `spademo@gmail.com`. If you copied live data into dev, try your **live** admin email/password on the dev site only.

After `npm run seed` only (before set-superadmin): `superadmin@starpolice.academy` / `superadmin123`

In DevTools → Network, dev panel API host must be **`starpolice-api-dev.onrender.com`**, not `starpolice-api`.

---

## After setup (daily)

- Test on **dev** → push `main` → **Deploy frontend to Netlify (dev site)** runs for panel changes.
- Live updates from your existing production Netlify + Render deploys.

See [ENVIRONMENTS.md](ENVIRONMENTS.md).
