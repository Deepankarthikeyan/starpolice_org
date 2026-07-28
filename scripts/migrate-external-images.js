const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

const BASE = "https://www.starpoliceacademy.in";
const ROOT = path.join(__dirname, "..", "assets", "images");

const downloads = [
  ["img/avatar/avatar-01.jpg", "about/instructors/avatar-01.jpg"],
  ["img/content/about-02.png", "about/instructors/about-02.png"],
  ["img/content/history-01.jpg", "about/instructors/history-01.jpg"],
  ["img/content/history-04.jpg", "about/instructors/history-04.jpg"],
  ["img/content/contact-info.jpg", "contact/contact-info.jpg"],
  ["img/portfolio/portfolio-01.jpg", "portfolio/portfolio-01.jpg"],
  ["img/portfolio/portfolio-02.jpg", "portfolio/portfolio-02.jpg"],
  ["img/service/service-01.jpg", "service/service-01.jpg"],
  ["img/books/a1.jpg", "books/a1.jpg"],
  ["img/books/t1.jpg", "books/t1.jpg"],
  ["img/books/b1.jpg", "books/b1.jpg"],
  ["img/books/c1.jpg", "books/c1.jpg"],
  ["img/books/e1.jpg", "books/e1.jpg"],
  ["img/books/g1.jpg", "books/g1.jpg"],
  ["img/books/h1.jpg", "books/h1.jpg"],
  ["img/books/h2.jpg", "books/h2.jpg"],
  ["img/books/i1.jpg", "books/i1.jpg"],
  ["img/books/p1.jpg", "books/p1.jpg"],
  ["img/books/py1.jpg", "books/py1.jpg"],
];

function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          fetchFile(response.headers.location).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function optimizeBuffer(buffer, targetPath) {
  const meta = await sharp(buffer).metadata();
  const maxWidth = targetPath.includes("/books/") ? 640 : 960;
  const targetBytes = 150 * 1024;

  if (meta.hasAlpha && targetPath.endsWith(".png")) {
    let quality = 90;
    while (quality >= 60) {
      const output = await sharp(buffer)
        .rotate()
        .resize({ width: maxWidth, withoutEnlargement: true })
        .png({ compressionLevel: 9, quality, palette: quality <= 75 })
        .toBuffer();
      if (output.length <= targetBytes || quality === 60) {
        return output;
      }
      quality -= 5;
    }
  }

  let quality = 82;
  while (quality >= 55) {
    const output = await sharp(buffer)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (output.length <= targetBytes || quality === 55) {
      return output;
    }
    quality -= 5;
  }

  return sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 55, mozjpeg: true })
    .toBuffer();
}

async function main() {
  for (const [remotePath, localPath] of downloads) {
    const url = `${BASE}/${remotePath}`;
    const fullPath = path.join(ROOT, localPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    try {
      const buffer = await fetchFile(url);
      const optimized = await optimizeBuffer(buffer, localPath);
      const jpegPath = fullPath.replace(/\.png$/i, ".jpg");
      const outputPath = localPath.endsWith(".png") && !(await sharp(buffer).metadata()).hasAlpha ? jpegPath : fullPath;

      if (outputPath.endsWith(".jpg") && fullPath.endsWith(".png")) {
        fs.writeFileSync(outputPath, optimized);
        console.log(`saved ${outputPath.replace(ROOT, "")} (${Math.round(optimized.length / 1024)}KB)`);
      } else {
        fs.writeFileSync(fullPath, optimized);
        console.log(`saved ${localPath} (${Math.round(optimized.length / 1024)}KB)`);
      }
    } catch (error) {
      console.error(`failed ${remotePath}:`, error.message);
    }
  }
}

main();
