# Email setup (invite links & OTP)

Panel invite and forgot-password emails are sent by the **API server** (`server/`). Without configuration, links only appear on screen — they are **not** sent to inbox.

## Production (starpoliceacademy.in)

Your live site uses `https://starpoliceacademy.in`. On **Render** (API: `starpolice-api.onrender.com`), set:

```env
RESEND_API_KEY=re_your_api_key_here
CLIENT_URL=https://starpoliceacademy.in
EMAIL_FROM=Star Police Academy <noreply@starpoliceacademy.in>
```

**Important:** `onboarding@resend.dev` only delivers to the email address on your Resend account. To send invites to students and staff, you must:

1. In [Resend → Domains](https://resend.com/domains), add `starpoliceacademy.in`
2. Add the DNS records Resend provides (usually at your domain registrar)
3. Wait until the domain shows **Verified**
4. Set `EMAIL_FROM` to an address on that domain (e.g. `noreply@starpoliceacademy.in`)
5. Redeploy or restart the Render service

Health check after setup: `https://starpoliceacademy.in/api/health` should show:

```json
"email": { "configured": true, "provider": "resend", "sandbox": false }
```

If `sandbox: true`, you are still on `onboarding@resend.dev` and cannot email arbitrary users.

## Quick setup — Resend (recommended)

1. Create a free account at [resend.com](https://resend.com)
2. Create an API key
3. Add to `server/.env` (local) or **Render → Environment** (production):

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=Star Police Academy <onboarding@resend.dev>
CLIENT_URL=https://your-frontend-url.com
```

4. Restart the API server
5. Check `GET /api/health` — should show `email.configured: true`

For local testing only, Resend allows sending from `onboarding@resend.dev` to your own Resend account email.

## Gmail SMTP

1. Enable 2-Step Verification on your Google account
2. Create an **App Password**: Google Account → Security → App passwords
3. Add to `server/.env` or Render:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=your@gmail.com
CLIENT_URL=https://your-frontend-url.com
```

4. Restart the API

## Cloudflare tunnel preview

The tunnel only exposes the **website**. The API still runs on the same machine. Add email credentials to `server/.env` on that machine and restart the API (`npm start` in `server/`).

Set `CLIENT_URL` to your tunnel URL, e.g.:

```env
CLIENT_URL=https://your-subdomain.trycloudflare.com
```

## Verify

After configuration, create a user in User Management. You should see **"Email sent successfully"** — not the yellow setup-link box.

Health check: `https://your-api-url/api/health` → `"email": { "configured": true, "provider": "resend" }`
