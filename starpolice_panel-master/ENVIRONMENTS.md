# Dev vs live environments

## Panel URLs (your sites)

| | URL | Use |
|---|-----|-----|
| **Dev** | https://starpoliceacademy-dev.netlify.app/admin | Testing new features; safe to break |
| **Dev admin login** | https://starpoliceacademy-dev.netlify.app/admin/login | Same panel, login route |
| **Live** | https://starpoliceacademy.in | Public production site |
| **Live admin login** | https://starpoliceacademy.in/admin/login | Real staff / super admin |

The React app is built with `base: /panel/`. Netlify rewrites `/admin/*` → panel SPA (see repo `netlify.toml`).

## Backend & database (must match)

| | API (typical) | MongoDB database | `CLIENT_URL` on API |
|---|----------------|------------------|---------------------|
| **Live** | https://starpolice-api.onrender.com | `starpolice_academy` (Atlas) | `https://starpoliceacademy.in` |
| **Dev** | Separate Render service recommended, e.g. `starpolice-api-dev` | `starpolice_academy_dev` | `https://starpoliceacademy-dev.netlify.app` |
| **Local** | `http://localhost:5000` | `starpolice_academy_dev` on `127.0.0.1` | `http://localhost:5173` |

`render.yaml` in this repo is configured for **live** (`CLIENT_URL=https://starpoliceacademy.in`).

## Important: dev Netlify must not use live data by accident

`starpolice_panel-master/netlify.toml` proxies `/api/*` to **production** Render:

`https://starpolice-api.onrender.com`

If **starpoliceacademy-dev.netlify.app** uses that file without overrides, the dev panel talks to the **live API and live database**.

To isolate dev data, on the **dev** Netlify site only:

1. Create a second Render web service (clone of `starpolice-api`) named e.g. `starpolice-api-dev`.
2. Set its env:
   - `MONGODB_URI` → Atlas URI with database **`starpolice_academy_dev`**
   - `CLIENT_URL` → `https://starpoliceacademy-dev.netlify.app`
   - Copy `JWT_SECRET` only for dev (use a **different** secret from live).
3. In Netlify → **starpoliceacademy-dev** → **Site configuration** → **Environment variables** → **Build**:
   - `VITE_API_URL` = `https://<your-dev-api>.onrender.com`  
   (no trailing slash)
4. Redeploy the dev site.

With `VITE_API_URL` set, the panel calls the dev API directly and **does not** rely on the production proxy in `netlify.toml`.

## Deploy flow

| Change | Dev | Live |
|--------|-----|------|
| Frontend (`main` branch) | Netlify **starpoliceacademy-dev** (connect branch `main` or `develop` as you prefer) | **starpoliceacademy.in** (production Netlify + custom domain) |
| API | Dev Render service auto-deploy from same repo / branch | `starpolice-api` on Render |
| Schema / fields | Test migrations on dev DB first | Deploy API → migrations run on live DB (see [DEV_AND_LIVE_DATABASE.md](DEV_AND_LIVE_DATABASE.md)) |

## Quick checks

- **Which API am I hitting?** Browser DevTools → Network → any `/api/...` request → host name.
- **Live health:** https://starpolice-api.onrender.com/api/health  
- **Email links** use `CLIENT_URL` on the API that serves that environment.
