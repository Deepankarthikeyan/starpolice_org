const { contact } = require("../../lib/star-content");
const { sendContactEmail } = require("../../lib/send-contact-email");

module.exports = async function contactHandler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ success: false, message: "Method not allowed." });
    return;
  }

  try {
    const result = await sendContactEmail(request.body);
    response.status(200).json(result);
  } catch (error) {
    console.error("Contact form email error:", error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500
        ? `We could not send your message right now. Please contact the academy directly at ${contact.formEmail}.`
        : error.message;

    response.status(statusCode).json({ success: false, message });
  }
};
