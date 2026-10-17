import test from "node:test";
import assert from "node:assert/strict";

const originalEnv = { ...process.env };

function restoreEnv() {
  process.env = { ...originalEnv };
}

test("getEmailProvider prefers SMTP when fully configured", async () => {
  restoreEnv();
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_USER = "test@gmail.com";
  process.env.SMTP_PASS = "app-password";
  process.env.RESEND_API_KEY = "re_test";

  const { getEmailProvider, getEmailProviders } = await import("./email.js");
  assert.equal(getEmailProvider(), "smtp");
  assert.deepEqual(getEmailProviders(), ["smtp", "resend"]);
});

test("getEmailProvider ignores SMTP without password", async () => {
  restoreEnv();
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_USER = "test@gmail.com";
  delete process.env.SMTP_PASS;
  process.env.RESEND_API_KEY = "re_test";

  const { getEmailProvider } = await import("./email.js");
  assert.equal(getEmailProvider(), "resend");
});

test("getEmailDiagnostics warns about Resend test sender", async () => {
  restoreEnv();
  process.env.RESEND_API_KEY = "re_test";
  process.env.EMAIL_FROM = "Star Police Academy <onboarding@resend.dev>";

  const { getEmailDiagnostics } = await import("./email.js");
  const diagnostics = getEmailDiagnostics();
  assert.equal(diagnostics.provider, "resend");
  assert.ok(
    diagnostics.warnings.some((warning) => warning.includes("onboarding@resend.dev"))
  );
});

test("Render production prefers Resend over SMTP", async () => {
  restoreEnv();
  process.env.RENDER = "true";
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_USER = "test@gmail.com";
  process.env.SMTP_PASS = "app-password";
  process.env.RESEND_API_KEY = "re_test";

  const { getEmailProviders, getEmailProvider } = await import("./email.js");
  assert.deepEqual(getEmailProviders(), ["resend"]);
  assert.equal(getEmailProvider(), "resend");
});

test("SMTP uses Gmail address when EMAIL_FROM domain differs", async () => {
  restoreEnv();
  delete process.env.RENDER;
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_USER = "deepankarthikeyan2000@gmail.com";
  process.env.SMTP_PASS = "app-password";
  process.env.EMAIL_FROM = "Star Police Academy <noreply@starpoliceacademy.in>";

  const { getEmailDiagnostics } = await import("./email.js");
  const diagnostics = getEmailDiagnostics();
  assert.equal(diagnostics.provider, "smtp");
  assert.ok(
    diagnostics.warnings.some((warning) => warning.includes("Gmail SMTP sends as deepankarthikeyan2000@gmail.com"))
  );
});
