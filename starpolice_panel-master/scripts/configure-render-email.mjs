/**
 * Configure Gmail SMTP on Render starpolice-api so invite/OTP emails reach all users.
 *
 * Required env:
 *   RENDER_API_KEY — Render account API key
 *   SMTP_USER — Gmail address (e.g. deepankarthikeyan2000@gmail.com)
 *   SMTP_PASS — 16-character Gmail app password
 *
 * Optional:
 *   RENDER_SERVICE_ID — defaults to discovering starpolice-api by name
 *   RENDER_DEPLOY_HOOK — triggers redeploy after env update
 *   API_URL — health check base (default https://starpolice-api.onrender.com)
 *   EMAIL_FROM — defaults to "Star Police Academy <SMTP_USER>"
 *   CLIENT_URL — defaults to https://starpoliceacademy.in
 */
const API_BASE = process.env.API_URL?.replace(/\/$/, "") || "https://starpolice-api.onrender.com";
const RENDER_API = "https://api.render.com/v1";

const SMTP_ENV = {
  SMTP_HOST: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
  SMTP_PORT: process.env.SMTP_PORT?.trim() || "587",
  SMTP_USER: process.env.SMTP_USER?.trim(),
  SMTP_PASS: process.env.SMTP_PASS?.trim(),
  EMAIL_FROM:
    process.env.EMAIL_FROM?.trim() ||
    (process.env.SMTP_USER?.trim()
      ? `Star Police Academy <${process.env.SMTP_USER.trim()}>`
      : null),
  CLIENT_URL: process.env.CLIENT_URL?.trim() || "https://starpoliceacademy.in",
};

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return value;
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
  if (!response.ok) {
    throw new Error(`Render API ${method} ${pathname} failed (${response.status}): ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function findServiceId(apiKey) {
  if (process.env.RENDER_SERVICE_ID?.trim()) {
    return process.env.RENDER_SERVICE_ID.trim();
  }

  let cursor = "";
  for (;;) {
    const query = new URLSearchParams({ limit: "100" });
    if (cursor) query.set("cursor", cursor);
    const page = await renderRequest(apiKey, `/services?${query.toString()}`);
    const items = page ?? [];

    for (const entry of items) {
      const service = entry.service ?? entry;
      const name = service?.name ?? service?.serviceDetails?.name;
      if (name === "starpolice-api") {
        return service.id ?? entry.id;
      }
    }

    const next = items.at(-1)?.cursor;
    if (!next) break;
    cursor = next;
  }

  throw new Error("Could not find Render service starpolice-api. Set RENDER_SERVICE_ID.");
}

async function setRenderEnvVar(apiKey, serviceId, key, value) {
  await renderRequest(apiKey, `/services/${serviceId}/env-vars/${key}`, {
    method: "PUT",
    body: { value },
  });
  console.log(`Set ${key} on Render service ${serviceId}`);
}

async function triggerDeploy() {
  const hook = process.env.RENDER_DEPLOY_HOOK?.trim();
  if (!hook) {
    console.log("RENDER_DEPLOY_HOOK not set; skipping deploy trigger.");
    return;
  }
  const response = await fetch(hook, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Deploy hook failed (${response.status})`);
  }
  console.log("Triggered Render deploy via hook.");
}

async function waitForSmtpHealth({ maxAttempts = 45, intervalMs = 20000 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(`${API_BASE}/api/health`);
    const body = await response.json();

    console.log(`Health attempt ${attempt}:`, JSON.stringify(body));

    const email = body.email ?? {};
    if (email.provider === "smtp" && email.configured === true) {
      return body;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`API did not report email.provider=smtp after ${maxAttempts} attempts.`);
}

async function main() {
  const apiKey = requireEnv("RENDER_API_KEY");
  SMTP_ENV.SMTP_USER = requireEnv("SMTP_USER");
  SMTP_ENV.SMTP_PASS = requireEnv("SMTP_PASS");
  if (!SMTP_ENV.EMAIL_FROM) {
    SMTP_ENV.EMAIL_FROM = `Star Police Academy <${SMTP_ENV.SMTP_USER}>`;
  }

  const serviceId = await findServiceId(apiKey);
  console.log("Render service:", serviceId);

  for (const [key, value] of Object.entries(SMTP_ENV)) {
    if (!value) continue;
    await setRenderEnvVar(apiKey, serviceId, key, value);
  }

  await triggerDeploy();
  const health = await waitForSmtpHealth();
  console.log("Gmail SMTP configured. Email health:", JSON.stringify(health.email));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
