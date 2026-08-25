const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const panelDist = path.join(rootDir, "starpolice_panel-master", "package", "dist");
const panelPublic = path.join(rootDir, "public", "panel");

if (!fs.existsSync(path.join(panelDist, "index.html"))) {
  throw new Error("Panel build did not produce package/dist/index.html");
}

fs.rmSync(panelPublic, { recursive: true, force: true });
fs.cpSync(panelDist, panelPublic, { recursive: true });
console.log("Copied panel build to public/panel.");