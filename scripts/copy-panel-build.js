const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const rootDir = path.join(__dirname, "..");
const panelDist = path.join(rootDir, "starpolice_panel-master", "package", "dist");
const panelPublic = path.join(rootDir, "public", "panel");
const faviconSource = path.join(
  rootDir,
  "starpolice_panel-master",
  "package",
  "src",
  "assets",
  "images",
  "star-police-academy-emblem.png"
);

if (!fs.existsSync(path.join(panelDist, "index.html"))) {
  throw new Error("Panel build did not produce package/dist/index.html");
}

async function copyPanelBuild() {
  fs.rmSync(panelPublic, { recursive: true, force: true });
  fs.cpSync(panelDist, panelPublic, { recursive: true });

  const faviconSizes = [
    ["favicon.png", 144],
    ["favicon-180.png", 180],
    ["favicon-192.png", 192],
    ["favicon-256.png", 256],
    ["favicon-512.png", 512],
    ["favicon-32.png", 32],
    ["favicon-16.png", 16],
  ];

  for (const [filename, size] of faviconSizes) {
    await sharp(faviconSource)
      .extract({ left: 10, top: 0, width: 110, height: 120 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(panelPublic, filename));
  }

  console.log("Copied panel build and generated text-free favicon assets.");
}

copyPanelBuild().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});