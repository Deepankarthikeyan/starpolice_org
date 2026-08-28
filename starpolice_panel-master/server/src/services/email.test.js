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
