const express = require("express");
const next = require("next");
const path = require("path");
const { contact } = require("./lib/star-content");
const { sendContactEmail } = require("./lib/send-contact-email");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "localhost";
const port = Number(process.env.PORT) || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const rootDir = __dirname;

function serveDirectory(server, route, directory) {
  server.use(route, express.static(path.join(rootDir, directory), { index: false }));
}

function serveFile(server, route, file) {
  server.get(route, (_request, response) => {
    response.sendFile(path.join(rootDir, file));
  });
}


app.prepare().then(() => {
  const server = express();

  server.use(express.json());

  server.post("/api/contact", async (request, response) => {
    try {
      const result = await sendContactEmail(request.body);
      response.json(result);
    } catch (error) {
      console.error("Contact form email error:", error);

      const statusCode = error.statusCode || 500;
      const message =
        statusCode === 500
          ? `We could not send your message right now. Please contact the academy directly at ${contact.formEmail}.`
          : error.message;

      response.status(statusCode).json({ success: false, message });
    }
  });

  serveDirectory(server, "/assets", "assets");
  serveDirectory(server, "/documents", "documents");
  serveDirectory(server, "/echooling-rtl/assets", "echooling-rtl/assets");
  serveDirectory(server, "/echooling-rtl/landing/assets", "echooling-rtl/landing/assets");
  serveDirectory(server, "/echooling-rtl/landing/landing/assets", "echooling-rtl/landing/landing/assets");

  serveFile(server, "/style.css", "style.css");
  serveFile(server, "/variables.css", "variables.css");
  serveFile(server, "/echooling-rtl/style.css", "echooling-rtl/style.css");
  serveFile(server, "/echooling-rtl/variables.css", "echooling-rtl/variables.css");
  serveFile(server, "/echooling-rtl/landing/style.css", "echooling-rtl/landing/style.css");
  serveFile(server, "/echooling-rtl/landing/landing/style.css", "echooling-rtl/landing/landing/style.css");

  server.use((request, response) => handle(request, response));

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
