/**
 * Wire dev stack: Atlas DB starpolice_academy_dev + Render starpolice-api-dev + Netlify dev site.
 *
 * Required env:
 *   MONGODB_URI          — live Atlas URI (…/starpolice_academy)
 *   RENDER_API_KEY       — Render → Account → API Keys
 *
 * Optional:
 *   RENDER_DEV_SERVICE_ID — if starpolice-api-dev already exists
 *   RENDER_DEV_DEPLOY_HOOK
 *   NETLIFY_AUTH_TOKEN
 *   NETLIFY_DEV_SITE_ID  — or NETLIFY_DEV_SITE_NAME=starpoliceacademy-dev
 *   DEV_API_URL          — default https://starpolice-api-dev.onrender.com
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RENDER_API = "https://api.render.com/v1";
const NETLIFY_API = "https://api.netlify.com/api/v1";
const DEV_PANEL_URL = "https://starpoliceacademy-dev.netlify.app";
const DEFAULT_DEV_API = "https://starpolice-api-dev.onrender.com";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return value;
}

function toDevMongoUri(liveUri) {
  if (liveUri.includes("starpolice_academy_dev")) return liveUri;
  if (liveUri.includes("/starpolice_academy")) {
    return liveUri.replace("/starpolice_academy", "/starpolice_academy_dev");
  }
  const trimmed = liveUri.replace(/\/$/, "");
  return `${trimmed}/starpolice_academy_dev`;
}

async function renderRequest(apiKey, pathname, { method = "GET", body } = {}) {
  const response = await fetch(`${RENDER_API}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Render ${method} ${pathname} (${response.status}): ${text}`);
  return text ? JSON.parse(text) : null;
}

async function findRenderDevServiceId(apiKey) {
  if (process.env.RENDER_DEV_SERVICE_ID?.trim()) {
    return process.env.RENDER_DEV_SERVICE_ID.trim();
  }
  let cursor = "";
  for (;;) {
    const query = new URLSearchParams({ limit: "100" });
    if (cursor) query.set("cursor", cursor);
    const page = await renderRequest(apiKey, `/services?${query}`);
    for (const entry of page ?? []) {
      const service = entry.service ?? entry;
      const name = service?.name ?? service?.serviceDetails?.name;
      if (name === "starpolice-api-dev") return service.id ?? entry.id;
    }
    const next = page?.at(-1)?.cursor;
    if (!next) break;
    cursor = next;
  }
  return null;
}

async function setRenderEnv(apiKey, serviceId, key, value) {
  await renderRequest(apiKey, `/services/${serviceId}/env-vars/${key}`, {
    method: "PUT",
    body: { value },
  });
  console.log(`Render: set ${key} on ${serviceId}`);
}

async function netlifyRequest(token, pathname, { method = "GET", body } = {}) {
  const response = await fetch(`${NETLIFY_API}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Netlify ${method} ${pathname} (${response.status}): ${text}`);
  return text ? JSON.parse(text) : null;
}

async function findNetlifyDevSiteId(token) {
  if (process.env.NETLIFY_DEV_SITE_ID?.trim()) {
    return process.env.NETLIFY_DEV_SITE_ID.trim();
  }
  const name = process.env.NETLIFY_DEV_SITE_NAME?.trim() || "starpoliceacademy-dev";
  const sites = await netlifyRequest(token, "/sites");
  const match = sites.find((s) => s.name === name || s.subdomain === name);
  if (!match) throw new Error(`Netlify site not found: ${name}`);
  return match.id;
}

async function setNetlifyBuildEnv(token, siteId, key, value) {
  await netlifyRequest(token, `/accounts/${await netlifyAccountId(token)}/env/${key}?site_id=${siteId}`, {
    method: "PUT",
    body: {
      key,
      scopes: ["builds"],
      values: [{ value, context: "all" }],
    },
  });
  console.log(`Netlify: set build env ${key} on site ${siteId}`);
}

let cachedAccountId;
async function netlifyAccountId(token) {
  if (cachedAccountId) return cachedAccountId;
  const user = await netlifyRequest(token, "/user");
  cachedAccountId = user.personal_account_id || user.account_id;
  return cachedAccountId;
}

async function triggerNetlifyBuild(token, siteId) {
  await netlifyRequest(token, `/sites/${siteId}/builds`, {
    method: "POST",
    body: { clear_cache: true },
  });
  console.log("Netlify: triggered build for dev site");
}

function runSeed(mongoUri) {
  const serverDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "server");
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "seed"], {
      cwd: serverDir,
      env: { ...process.env, MONGODB_URI: mongoUri },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`seed exit ${code}`))));
  });
}

async function waitHealth(apiUrl, max = 30) {
  for (let i = 1; i <= max; i += 1) {
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/health`);
      const body = await res.json();
      console.log(`Health ${i}:`, JSON.stringify(body));
      if (body.status === "ok" && body.database === "mongodb") return body;
    } catch {
      console.log(`Health ${i}: not ready`);
    }
    await new Promise((r) => setTimeout(r, 15000));
  }
  throw new Error("Dev API health check timed out");
}

async function main() {
  const liveUri = requireEnv("MONGODB_URI");
  const apiKey = requireEnv("RENDER_API_KEY");
  const devUri = toDevMongoUri(liveUri);
  const devApiUrl = (process.env.DEV_API_URL || DEFAULT_DEV_API).replace(/\/$/, "");

  console.log("Dev MongoDB URI database: starpolice_academy_dev");
  console.log("Dev API URL:", devApiUrl);
  console.log("Dev panel:", DEV_PANEL_URL);

  const serviceId = await findRenderDevServiceId(apiKey);
  if (!serviceId) {
    console.error(`
Could not find Render service "starpolice-api-dev".

Create it once:
  1. Render → New → Blueprint
  2. Select repo and file: starpolice_panel-master/render-dev.yaml
  3. When prompted, paste MONGODB_URI (dev): ${devUri.replace(/:[^:@/]+@/, ":***@")}
  4. Re-run this script.
`);
    process.exit(1);
  }

  await setRenderEnv(apiKey, serviceId, "MONGODB_URI", devUri);
  await setRenderEnv(apiKey, serviceId, "CLIENT_URL", DEV_PANEL_URL);

  const hook = process.env.RENDER_DEV_DEPLOY_HOOK?.trim();
  if (hook) {
    await fetch(hook, { method: "POST" });
    console.log("Triggered Render dev deploy hook");
  } else {
    console.log("Tip: set RENDER_DEV_DEPLOY_HOOK to redeploy after env changes");
  }

  const netlifyToken = process.env.NETLIFY_AUTH_TOKEN?.trim();
  if (netlifyToken) {
    const siteId = await findNetlifyDevSiteId(netlifyToken);
    await setNetlifyBuildEnv(netlifyToken, siteId, "VITE_API_URL", devApiUrl);
    await triggerNetlifyBuild(netlifyToken, siteId);
  } else {
    console.log("Skip Netlify (set NETLIFY_AUTH_TOKEN to configure dev site automatically)");
  }

  console.log("Waiting for dev API (may take a few minutes on free tier)...");
  await waitHealth(devApiUrl);

  console.log("Seeding dev database (demo users/leads)...");
  await runSeed(devUri);

  console.log(`
Done.

Dev panel:  ${DEV_PANEL_URL}/admin/login
Dev API:    ${devApiUrl}/api/health
Login:      superadmin@starpolice.academy / superadmin123

Live panel: https://starpoliceacademy.in/admin/login (unchanged)
`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
