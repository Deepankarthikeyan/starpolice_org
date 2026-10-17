const nodemailer = require("nodemailer");
const { contact } = require("./star-content");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getMailConfig() {
  const recipient = process.env.CONTACT_TO || contact.formEmail;
  const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS;
  const smtpFrom = process.env.SMTP_FROM || process.env.MAIL_FROM || smtpUser || recipient;

  return { recipient, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom };
}

async function sendContactEmail(payload) {
  const { name, email, subject, phone, message } = payload || {};

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    const error = new Error("Please fill in the required fields.");
    error.statusCode = 400;
    throw error;
  }

  const { recipient, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = getMailConfig();

  if (!smtpUser || !smtpPass) {
    const error = new Error(
      "Email delivery is not configured on the server. Please call or email the academy directly."
    );
    error.statusCode = 503;
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const safeName = escapeHtml(name.trim());
  const safeEmail = escapeHtml(email.trim());
  const safeSubject = escapeHtml(subject.trim());
  const safePhone = escapeHtml(phone?.trim() || "Not provided");
  const safeMessage = escapeHtml(message.trim()).replace(/\n/g, "<br />");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin-bottom: 12px;">New contact enquiry</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Phone:</strong> ${safePhone}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    </div>
  `;

  const text = [
    "New contact enquiry",
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `Phone: ${phone?.trim() || "Not provided"}`,
    `Subject: ${subject.trim()}`,
    "",
    message.trim(),
  ].join("\n");

  await transporter.sendMail({
    from: `Star Police Academy <${smtpFrom}>`,
    to: recipient,
    replyTo: `"${name.trim()}" <${email.trim()}>`,
    subject: `[Contact Form] ${subject.trim()}`,
    html,
    text,
  });

  return { success: true, message: "Your message has been sent successfully." };
}

module.exports = { sendContactEmail, getMailConfig };
