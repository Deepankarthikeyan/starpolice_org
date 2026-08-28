import nodemailer from "nodemailer";

let transporter = null;

function getClientUrl(requestedUrl) {
  const trimmed = typeof requestedUrl === "string" ? requestedUrl.trim() : "";
  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

function normalizeEnvValue(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  const keyPrefix = trimmed.match(/^(?:EMAIL_FROM|SMTP_[A-Z_]+|CLIENT_URL|RESEND_API_KEY)=(.*)$/i);
  return keyPrefix ? keyPrefix[1].trim() : trimmed;
}

function readEnv(name) {
  return normalizeEnvValue(process.env[name] || "");
}

function isSmtpConfigured() {
  return Boolean(readEnv("SMTP_HOST") && readEnv("SMTP_USER") && readEnv("SMTP_PASS"));
}

function isResendConfigured() {
  return Boolean(readEnv("RESEND_API_KEY"));
}

export function getEmailProviders() {
  const providers = [];
  if (isSmtpConfigured()) providers.push("smtp");
  if (isResendConfigured()) providers.push("resend");
  return providers;
}

export function getEmailProvider() {
  return getEmailProviders()[0] || null;
}

export function isEmailConfigured() {
  return getEmailProviders().length > 0;
}

function getFromAddressForProvider(provider) {
  const from = readEnv("EMAIL_FROM");
  if (from) return from;

  if (provider === "resend") {
    throw new Error(
      "EMAIL_FROM is required for Resend. Verify your domain in Resend and set EMAIL_FROM to an address on that domain."
    );
  }

  return readEnv("SMTP_USER") || "noreply@starpolice.academy";
}

export function getEmailDiagnostics() {
  const providers = getEmailProviders();
  const warnings = [];
  const from = readEnv("EMAIL_FROM");

  if (!providers.length) {
    warnings.push(
      "Email is not configured. Add SMTP_USER + SMTP_PASS (Gmail app password) or RESEND_API_KEY on the API server."
    );
  }

  if (isSmtpConfigured() && !from) {
    warnings.push("EMAIL_FROM is not set; SMTP will use SMTP_USER as the sender address.");
  }

  if (isResendConfigured() && !from) {
    warnings.push("EMAIL_FROM is required for Resend delivery.");
  }

  if (/onboarding@resend\.dev/i.test(from)) {
    warnings.push(
      "EMAIL_FROM uses onboarding@resend.dev — Resend only delivers to the Resend account owner's email. Verify starpoliceacademy.in in Resend or switch to Gmail SMTP."
    );
  }

  if (from && /@starpoliceacademy\.in/i.test(from) && isResendConfigured() && !isSmtpConfigured()) {
    warnings.push(
      "EMAIL_FROM uses starpoliceacademy.in with Resend only. Verify the domain in Resend, or add Gmail SMTP (SMTP_USER + SMTP_PASS) for reliable delivery."
    );
  }

  if (process.env.EMAIL_FROM?.trim() && /^EMAIL_FROM=/i.test(process.env.EMAIL_FROM.trim())) {
    warnings.push(
      'EMAIL_FROM value includes "EMAIL_FROM=" — set the value to only: Star Police Academy <your@gmail.com>'
    );
  }

  if (readEnv("SMTP_USER") && !readEnv("SMTP_HOST")) {
    warnings.push("SMTP_HOST is missing — add SMTP_HOST=smtp.gmail.com on Render.");
  }

  if (readEnv("SMTP_HOST") && readEnv("SMTP_USER") && !readEnv("SMTP_PASS")) {
    warnings.push("SMTP_PASS is missing — add your Gmail app password on Render.");
  }

  if (process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && !process.env.SMTP_PASS?.trim()) {
    warnings.push("SMTP_USER is set but SMTP_PASS is missing — SMTP cannot send until the app password is added.");
  }

  return {
    configured: providers.length > 0,
    provider: providers[0] || null,
    providers,
    from: from || null,
    warnings,
  };
}

function getTransporter() {
  if (transporter) return transporter;

  if (!isSmtpConfigured()) {
    return null;
  }

  const port = Number(readEnv("SMTP_PORT") || 587);
  transporter = nodemailer.createTransport({
    host: readEnv("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: {
      user: readEnv("SMTP_USER"),
      pass: readEnv("SMTP_PASS"),
    },
  });

  return transporter;
}

function humanizeDeliveryError(error) {
  const message = error?.message || String(error);
  if (/only send testing emails to your own email/i.test(message)) {
    return "Resend test mode only delivers to the Resend account email. Verify your domain in Resend or configure Gmail SMTP on the API server.";
  }
  if (/domain is not verified/i.test(message) || /not verified/i.test(message)) {
    return "The sending domain is not verified in Resend. Verify starpoliceacademy.in in Resend or configure Gmail SMTP on the API server.";
  }
  return message;
}

function panelLabel(panel) {
  if (panel === "staff") return "Staff Panel";
  if (panel === "student") return "Student Panel";
  return "Admin Panel";
}

function purposeLabel(purpose) {
  return purpose === "reset" ? "Reset your password" : "Set up your password";
}

async function sendViaResend({ to, subject, html, text, from }) {
  const apiKey = readEnv("RESEND_API_KEY");
  if (!apiKey) return null;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `Resend API error (${response.status})`);
  }

  return { provider: "resend", id: data.id };
}

async function sendViaSmtp(mail) {
  const transport = getTransporter();
  if (!transport) return null;

  const info = await transport.sendMail(mail);
  return { provider: "smtp", id: info.messageId };
}

function logDevFallback(payload) {
  console.log("[email:dev] Email not configured or delivery failed — logged to console:");
  console.log(JSON.stringify(payload, null, 2));
}

export async function sendPasswordEmail({
  to,
  name,
  panel,
  purpose,
  token,
  otp,
  isOtpOnly = false,
  clientUrl: requestedClientUrl,
}) {
  const clientUrl = getClientUrl(requestedClientUrl);
  const setupUrl = `${clientUrl}/auth/setup-password?token=${encodeURIComponent(token)}`;
  const panelName = panelLabel(panel);
  const action = purposeLabel(purpose);

  const subject = isOtpOnly
    ? `Star Police Academy – verification code for ${panelName}`
    : `Star Police Academy – ${action} for ${panelName}`;

  const textLines = isOtpOnly
    ? [
        `Hello ${name || "there"},`,
        "",
        `Your verification code for ${panelName} is: ${otp}`,
        "",
        "This code expires in 10 minutes.",
        "",
        "If you did not request this, you can ignore this email.",
      ]
    : [
        `Hello ${name || "there"},`,
        "",
        `${action} for your ${panelName} account at Star Police Academy.`,
        "",
        `Open this link to continue: ${setupUrl}`,
        "",
        "This link expires in 24 hours.",
        "",
        "If you did not request this, you can ignore this email.",
      ];

  const html = isOtpOnly
    ? `
      <p>Hello ${name || "there"},</p>
      <p>Your verification code for <strong>${panelName}</strong> is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${otp}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `
    : `
      <p>Hello ${name || "there"},</p>
      <p>${action} for your <strong>${panelName}</strong> account at Star Police Academy.</p>
      <p><a href="${setupUrl}" style="display:inline-block;padding:12px 20px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:6px;">Continue to password setup</a></p>
      <p>Or copy this link: <a href="${setupUrl}">${setupUrl}</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

  const mailPayload = {
    to,
    subject,
    text: textLines.join("\n"),
    html,
  };

  if (!isEmailConfigured()) {
    logDevFallback({ to, subject, setupUrl, otp: isOtpOnly ? otp : undefined });
    return { delivered: false, devMode: true, setupUrl, otp: isOtpOnly ? otp : undefined };
  }

  const providers = getEmailProviders();
  const errors = [];

  for (const provider of providers) {
    try {
      const from = getFromAddressForProvider(provider);
      const payload = { ...mailPayload, from };
      const result =
        provider === "resend"
          ? await sendViaResend({
              to,
              subject,
              html: payload.html,
              text: payload.text,
              from,
            })
          : await sendViaSmtp(payload);

      if (!result) {
        throw new Error(`${provider} provider is not available.`);
      }

      console.log(`[email] Sent via ${result.provider} to ${to} (id: ${result.id || "ok"})`);
      return { delivered: true, devMode: false, provider: result.provider };
    } catch (error) {
      const friendlyError = humanizeDeliveryError(error);
      console.error(`[email] Delivery failed via ${provider}:`, friendlyError);
      errors.push(`${provider}: ${friendlyError}`);
    }
  }

  const deliveryError = errors.join(" | ");
  logDevFallback({ to, subject, setupUrl, otp: isOtpOnly ? otp : undefined, error: deliveryError });
  return {
    delivered: false,
    devMode: true,
    setupUrl,
    otp: isOtpOnly ? otp : undefined,
    deliveryError,
  };
}
