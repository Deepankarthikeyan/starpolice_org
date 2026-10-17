const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..", "assets", "images");
const SKIP_BYTES = 80 * 1024;
const conversions = [];

function getCategory(relativePath) {
  const value = relativePath.replace(/\\/g, "/");

  if (value.includes("/logos/") || value.includes("favicon")) {
    return "logo";
  }
  if (value.includes("/hero/") || value.includes("/breadcrumbs/") || value.includes("cta.")) {
    return "hero";
  }
  if (value.includes("/courses/") || value.includes("/course-filter/")) {
    return "course";
  }
  if (value.includes("/gallery/")) {
    return "gallery";
  }
  if (
    value.includes("/counter/") ||
    value.includes("/topics/icon") ||
    value.includes("/course/small-image/") ||
    value.includes("/testimonial/coma")
  ) {
    return "thumb";
  }
  if (value.includes("/about/shape") || value.includes("/banner2/") || value.includes("/acc.png")) {
    return "decor";
  }

  return "default";
}

function getMaxWidth(category, meta) {
  switch (category) {
    case "logo":
      return 512;
    case "thumb":
      return 160;
    case "decor":
      return 480;
    case "hero":
      return 1600;
    case "course":
      return 960;
    case "gallery":
      return 960;
    default:
      return 1200;
  }
}

function getTargetBytes(category) {
  switch (category) {
    case "logo":
      return 120 * 1024;
    case "thumb":
      return 60 * 1024;
    case "decor":
      return 80 * 1024;
    case "hero":
      return 250 * 1024;
    case "course":
      return 180 * 1024;
    case "gallery":
      return 150 * 1024;
    default:
      return 200 * 1024;
  }
}

function shouldKeepPng(relativePath, meta) {
  const value = relativePath.replace(/\\/g, "/").toLowerCase();

  if (meta.hasAlpha) {
    return true;
  }

  return (
    value.includes("/logos/") ||
    value.includes("favicon") ||
    value.includes("/shape") ||
    value.includes("/banner2/") ||
    value.includes("/hero/0") ||
    value.includes("/about/dot") ||
    value.includes("/about/shape") ||
    value.includes("/acc.png") ||
    value.includes("/coma.png") ||
    value.includes("/line_01.png") ||
    value.endsWith("/04.png") ||
    value.endsWith("/05.png")
  );
}

async function encodeJpeg(input, maxWidth, targetBytes) {
  let quality = 82;

  while (quality >= 55) {
    const buffer = await sharp(input)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (buffer.length <= targetBytes || quality === 55) {
      return buffer;
    }

    quality -= 5;
  }

  return sharp(input)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 55, mozjpeg: true })
    .toBuffer();
}

async function encodePng(input, maxWidth, targetBytes) {
  let quality = 90;

  while (quality >= 60) {
    const buffer = await sharp(input)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality, palette: quality <= 75 })
      .toBuffer();

    if (buffer.length <= targetBytes || quality === 60) {
      return buffer;
    }

    quality -= 5;
  }

  return sharp(input)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 60, palette: true })
    .toBuffer();
}

async function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimizeFile(filePath) {
  const stat = fs.statSync(filePath);
  const relativePath = path.relative(ROOT, filePath);
  const category = getCategory(relativePath);
  const meta = await sharp(filePath).metadata();
  const maxWidth = getMaxWidth(category, meta);
  const targetBytes = getTargetBytes(category);
  const keepPng = shouldKeepPng(relativePath, meta);
  const ext = path.extname(filePath).toLowerCase();

  if (stat.size <= SKIP_BYTES && meta.width <= maxWidth) {
    return { relativePath, action: "skipped", before: stat.size, after: stat.size };
  }

  let output;
  let nextPath = filePath;

  if (keepPng) {
    output = await encodePng(filePath, maxWidth, targetBytes);
    if (ext !== ".png") {
      nextPath = filePath.replace(/\.(jpe?g)$/i, ".png");
    }
  } else {
    output = await encodeJpeg(filePath, maxWidth, targetBytes);
    nextPath = filePath.replace(/\.png$/i, ".jpg");
  }

  if (nextPath !== filePath && fs.existsSync(filePath)) {
    fs.writeFileSync(nextPath, output);
    fs.unlinkSync(filePath);
    conversions.push({
      from: `/assets/images/${relativePath.replace(/\\/g, "/")}`,
      to: `/assets/images/${path.relative(ROOT, nextPath).replace(/\\/g, "/")}`,
    });
  } else {
    fs.writeFileSync(nextPath, output);
  }

  return {
    relativePath,
    action: nextPath !== filePath ? "converted" : "optimized",
    before: stat.size,
    after: output.length,
  };
}

async function main() {
  const files = await walk(ROOT);
  const results = [];
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const filePath of files.sort()) {
    const result = await optimizeFile(filePath);
    results.push(result);
    beforeTotal += result.before;
    afterTotal += result.after;
  }

  const reportPath = path.join(__dirname, "optimize-images-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ conversions, results }, null, 2),
    "utf8"
  );

  console.log(`Processed ${results.length} images`);
  console.log(`Before: ${Math.round(beforeTotal / 1024 / 1024)} MB`);
  console.log(`After: ${Math.round(afterTotal / 1024 / 1024)} MB`);
  console.log(`Converted ${conversions.length} PNG files to JPEG`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
