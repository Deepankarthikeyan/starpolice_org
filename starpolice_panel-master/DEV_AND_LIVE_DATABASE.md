# Dev database vs live (production) database

Star Police uses **MongoDB**. There are no SQL “tables/columns” in the database itself — **shape comes from the API code** (`server/src/models/*.js`) plus optional **migrations** (`server/src/migrations/*.js`) that run when the API starts.

You can keep **real data only on live** and use a **separate dev database** for testing. Schema changes ship via **git + deploy + migrations**, not by copying dev data to production.

## Environments

See **[ENVIRONMENTS.md](ENVIRONMENTS.md)** for official panel URLs.

| Environment | Panel | API | Database |
|-------------|-------|-----|----------|
| **Live** | https://starpoliceacademy.in/admin/login | https://starpolice-api.onrender.com | Atlas → `starpolice_academy` |
| **Dev (Netlify)** | https://starpoliceacademy-dev.netlify.app/admin | Dev Render API + `VITE_API_URL` on dev Netlify (see ENVIRONMENTS.md) | Atlas → `starpolice_academy_dev` |
| **Local** | `npm run dev` in `package/` | `npm start` in `server/` | `starpolice_academy_dev` on localhost |
| **Temp Cloudflare tunnel** | `*.trycloudflare.com` | tunnel URL | Local MongoDB only — not live |

## Rule: never overwrite live data

- Do **not** `mongorestore` a dev dump onto the live Atlas database.
- Do **not** point local `.env` at the live `MONGODB_URI` for experiments (risk of deleting or corrupting real leads/students).
- **OK:** copy live → dev for debugging (one-way), or run the same **migration scripts** on dev first, then on live after deploy.

## Recommended setup: two database names

Use the **same Atlas cluster** (or separate clusters) with **two database names**:

```text
# Live (Render env var only — do not put in local .env)
mongodb+srv://USER:PASS@cluster.mongodb.net/starpolice_academy

# Local dev (server/.env)
mongodb://127.0.0.1:27017/starpolice_academy_dev
# or Atlas dev:
mongodb+srv://USER:PASS@cluster.mongodb.net/starpolice_academy_dev
```

Copy `server/.env.example` → `server/.env` and set the **dev** URI.

Seed demo data only on dev:

```bash
cd server
npm run seed
```

## How “schema” changes reach live without changing existing data

1. **Change the model** in `server/src/models/` (new fields, enums, indexes).
2. **Add a migration** in `server/src/migrations/` if you need to backfill or fix existing documents (see existing files like `fixUsernameIndex.js`).
3. **Register the migration** in `server/src/index.js` → `runMigrations()`.
4. **Test locally** against `starpolice_academy_dev`.
5. **Push to `main`** → Netlify (panel) + Render (API) redeploy.
6. On Render startup, migrations run against **live** Atlas — they should only **add/update fields**, not wipe collections.

New fields in Mongoose often work with **no migration** (defaults apply to new writes). Migrations are for backfills, indexes, and one-time data fixes.

### Example: new lead field

- Add property to `Lead` schema with `default: ""`.
- Deploy API.
- Old lead documents simply omit the field until edited; the app treats missing values as empty.

### Example: rename or reshape data

- Write a migration: `updateMany` / `aggregate` to set new fields from old ones.
- Run on dev, verify, deploy to live.

## Optional: refresh dev with a copy of live data (read-only testing)

One-way copy **production → dev** (never the reverse):

```bash
# Requires Atlas Network Access + mongodump/mongorestore installed
mongodump --uri="$LIVE_MONGODB_URI" --out=/tmp/spa-live-dump
mongorestore --uri="$DEV_MONGODB_URI" --drop /tmp/spa-live-dump/starpolice_academy
```

Use a **dev** URI whose database name is `starpolice_academy_dev` (adjust dump folder name if needed). This replaces **dev** data only.

## Check which database you are using

- API health: `GET /api/health` on your API host.
- Render dashboard → **starpolice-api** → **Environment** → `MONGODB_URI` (live).
- Local: `grep MONGODB_URI server/.env`.

## Summary

| Goal | What to do |
|------|------------|
| Same **structure** as live on dev | Same code branch + dev `MONGODB_URI` + `npm run seed` (optional demo rows) |
| Change fields / “columns” | Edit Mongoose models + migrations; deploy API |
| Keep live **data** safe | Separate DB name; migrations only; no dev→live restore |
| Test with real-shaped data | One-time live→dev dump |

For Atlas connection to Render, see [DEPLOYMENT.md](DEPLOYMENT.md) and GitHub workflow **Connect MongoDB Atlas to Render**.
