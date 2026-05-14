const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 9283;
const publicDir = path.join(__dirname, "public");

const printOptions = [
  {
    id: "print-4x6-gloss",
    name: "클래식 컬러 인화",
    size: "4x6",
    price: 1200,
    paperType: "유광지",
    recommended: true
  },
  {
    id: "print-5x5-matte",
    name: "스퀘어 무광 인화",
    size: "5x5",
    price: 1600,
    paperType: "무광지",
    recommended: false
  },
  {
    id: "print-6x8-silk",
    name: "프리미엄 실크 인화",
    size: "6x8",
    price: 2600,
    paperType: "실크지",
    recommended: true
  },
  {
    id: "print-8x10-pearl",
    name: "갤러리 펄 인화",
    size: "8x10",
    price: 4200,
    paperType: "펄지",
    recommended: false
  },
  {
    id: "print-a4-matte",
    name: "A4 포스터 인화",
    size: "A4",
    price: 6900,
    paperType: "무광지",
    recommended: false
  },
  {
    id: "print-frame-ready",
    name: "액자 맞춤 인화",
    size: "11x14",
    price: 9800,
    paperType: "아카이브지",
    recommended: true
  }
];

const samplePhotos = [
  {
    id: "photo-001",
    fileName: "jeju-sunset-family.jpg",
    thumbnailUrl: "/assets/photo-landscape-01.svg",
    ratio: "landscape",
    selected: true
  },
  {
    id: "photo-002",
    fileName: "wedding-portrait-blue.jpg",
    thumbnailUrl: "/assets/photo-portrait-01.svg",
    ratio: "portrait",
    selected: true
  },
  {
    id: "photo-003",
    fileName: "birthday-table-memory.jpg",
    thumbnailUrl: "/assets/photo-landscape-02.svg",
    ratio: "landscape",
    selected: true
  },
  {
    id: "photo-004",
    fileName: "travel-window-coral.jpg",
    thumbnailUrl: "/assets/photo-portrait-02.svg",
    ratio: "portrait",
    selected: false
  },
  {
    id: "photo-005",
    fileName: "newborn-soft-light.jpg",
    thumbnailUrl: "/assets/photo-square-01.svg",
    ratio: "square",
    selected: false
  },
  {
    id: "photo-006",
    fileName: "city-night-skyline.jpg",
    thumbnailUrl: "/assets/photo-landscape-03.svg",
    ratio: "landscape",
    selected: false
  },
  {
    id: "photo-007",
    fileName: "graduation-flower.jpg",
    thumbnailUrl: "/assets/photo-portrait-03.svg",
    ratio: "portrait",
    selected: false
  },
  {
    id: "photo-008",
    fileName: "dog-park-weekend.jpg",
    thumbnailUrl: "/assets/photo-square-02.svg",
    ratio: "square",
    selected: false
  }
];

function runBuildCheck() {
  const requiredFiles = [
    "package.json",
    "README.md",
    "BUGS.md",
    "TODO.md",
    "server.js",
    "public/index.html",
    "public/styles.css",
    "public/app.js"
  ];

  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(__dirname, file)));
  if (missing.length > 0) {
    console.error(`Missing required files: ${missing.join(", ")}`);
    process.exit(1);
  }

  new Function(fs.readFileSync(path.join(__dirname, "public", "app.js"), "utf8"));
  console.log("site064 build check passed");
}

if (process.argv.includes("--check")) {
  runBuildCheck();
  process.exit(0);
}

app.use(express.json());
app.use(express.static(publicDir));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    site: "site064",
    service: "photo-print-studio",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/print-options", (req, res) => {
  res.json({
    options: printOptions
  });
});

app.get("/api/sample-photos", (req, res) => {
  res.json({
    photos: samplePhotos
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`site064 photo print studio running at http://localhost:${PORT}`);
});
