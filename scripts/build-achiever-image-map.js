const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const outputPath = path.join(rootDir, "lib", "achiever-image-map.js");
const achieverCount = 8;
const imagePattern = /\.(jpe?g|png|webp)$/i;

const achieverNames = [
  "VIGNESHWARAN. S",
  "VIGNESH M",
  "JAYARAJ. P",
  "MAGEHSWARAN. E",
  "CHANDRU. R",
  "CLINDON. F",
  "JEEVAKARUNYA. S",
  "ILAKKIYA. G",
];

const achieverImageStems = [
  "vignesh waran s",
  "vignesh m",
  "jeyaraj p",
  "mageshwaran e",
  "chandru r",
  "clindon f",
  "jeevakarunya s",
  "ilakkiya g",
];

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findAchieverImageDir() {
  const candidates = ["achievers", "acheivers"];

  for (const folderName of candidates) {
    const dirPath = path.join(rootDir, "assets", "images", folderName);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      continue;
    }

    const files = fs
      .readdirSync(dirPath)
      .filter((file) => imagePattern.test(file))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    if (files.length > 0) {
      return { folderName, dirPath, files };
    }
  }

  return null;
}

function matchFileForSerial(files, serialNo, name) {
  const serial = String(serialNo);
  const paddedSerial = serial.padStart(2, "0");
  const slug = slugifyName(name);
  const imageStem = achieverImageStems[serialNo - 1];
  const stemKey = imageStem ? normalizeKey(imageStem) : "";

  if (stemKey) {
    const stemMatch = files.find((file) => normalizeKey(path.parse(file).name) === stemKey);
    if (stemMatch) {
      return stemMatch;
    }
  }

  const exactMatches = [
    `${serial}.jpg`,
    `${serial}.jpeg`,
    `${serial}.png`,
    `${serial}.webp`,
    `${paddedSerial}.jpg`,
    `${paddedSerial}.jpeg`,
    `${paddedSerial}.png`,
    `${paddedSerial}.webp`,
  ].map((value) => value.toLowerCase());

  const directMatch = files.find((file) => exactMatches.includes(file.toLowerCase()));
  if (directMatch) {
    return directMatch;
  }

  const prefixMatch = files.find((file) => {
    const lower = file.toLowerCase();
    return (
      lower.startsWith(`${serial}.`) ||
      lower.startsWith(`${serial}-`) ||
      lower.startsWith(`${serial}_`) ||
      lower.startsWith(`${paddedSerial}.`) ||
      lower.startsWith(`${paddedSerial}-`) ||
      lower.startsWith(`${paddedSerial}_`)
    );
  });
  if (prefixMatch) {
    return prefixMatch;
  }

  const slugMatch = files.find((file) => file.toLowerCase().includes(slug));
  if (slugMatch) {
    return slugMatch;
  }

  return null;
}

function buildAchieverImageMap() {
  const imageDir = findAchieverImageDir();
  const map = {};
  const usedFiles = new Set();

  for (let index = 0; index < achieverCount; index += 1) {
    const serialNo = index + 1;
    const name = achieverNames[index];
    let matchedFile = null;

    if (imageDir) {
      matchedFile = matchFileForSerial(imageDir.files, serialNo, name);
      if (matchedFile) {
        usedFiles.add(matchedFile);
      }
    }

    map[serialNo] = matchedFile
      ? `/assets/images/${imageDir.folderName}/${matchedFile}`
      : null;
  }

  if (imageDir) {
    const unusedFiles = imageDir.files.filter((file) => !usedFiles.has(file));

    for (let index = 0; index < achieverCount; index += 1) {
      const serialNo = index + 1;
      if (!map[serialNo] && unusedFiles.length > 0) {
        const nextFile = unusedFiles.shift();
        map[serialNo] = `/assets/images/${imageDir.folderName}/${nextFile}`;
      }
    }
  }

  const fileContents = `module.exports = ${JSON.stringify(map, null, 2)};\n`;
  fs.writeFileSync(outputPath, fileContents, "utf8");

  const resolvedCount = Object.values(map).filter(Boolean).length;
  console.log(`Achiever image map updated (${resolvedCount}/${achieverCount} images found).`);
}

buildAchieverImageMap();
