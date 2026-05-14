const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 9280;
const publicDir = path.join(__dirname, "public");

const furniture = [
  {
    id: "FR-061-01",
    name: "라인 월넛 라운지 체어",
    space: "거실",
    material: "원목",
    colorOptions: ["walnut", "oak", "sand"],
    price: 680000,
    image: "/assets/furniture-chair.svg",
    deliveryDate: "2026-05-16",
    deliveryAvailable: true
  },
  {
    id: "FR-061-02",
    name: "모듈러 월넛 소파",
    space: "거실",
    material: "패브릭",
    colorOptions: ["walnut", "charcoal", "ivory"],
    price: 1890000,
    image: "/assets/furniture-sofa.svg",
    deliveryDate: "2026-05-21",
    deliveryAvailable: true
  },
  {
    id: "FR-061-03",
    name: "샌드 오크 다이닝 테이블",
    space: "다이닝",
    material: "원목",
    colorOptions: ["oak", "sand", "walnut"],
    price: 1240000,
    image: "/assets/furniture-table.svg",
    deliveryDate: "2026-05-18",
    deliveryAvailable: true
  },
  {
    id: "FR-061-04",
    name: "차콜 슬림 책장",
    space: "서재",
    material: "스틸",
    colorOptions: ["charcoal", "walnut"],
    price: 520000,
    image: "/assets/furniture-shelf.svg",
    deliveryDate: "2026-05-15",
    deliveryAvailable: true
  },
  {
    id: "FR-061-05",
    name: "크림 패브릭 베드",
    space: "침실",
    material: "패브릭",
    colorOptions: ["ivory", "sand", "charcoal"],
    price: 1480000,
    image: "/assets/furniture-bed.svg",
    deliveryDate: "2026-05-24",
    deliveryAvailable: false
  },
  {
    id: "FR-061-06",
    name: "월넛 리프트 커피 테이블",
    space: "거실",
    material: "원목",
    colorOptions: ["walnut", "oak"],
    price: 430000,
    image: "/assets/furniture-coffee.svg",
    deliveryDate: "2026-05-14",
    deliveryAvailable: true
  },
  {
    id: "FR-061-07",
    name: "오크 미디어 콘솔",
    space: "거실",
    material: "원목",
    colorOptions: ["oak", "walnut", "charcoal"],
    price: 790000,
    image: "/assets/furniture-console.svg",
    deliveryDate: "2026-05-19",
    deliveryAvailable: true
  },
  {
    id: "FR-061-08",
    name: "샌드 스툴 세트",
    space: "다이닝",
    material: "라탄",
    colorOptions: ["sand", "ivory", "oak"],
    price: 260000,
    image: "/assets/furniture-stool.svg",
    deliveryDate: "2026-05-13",
    deliveryAvailable: true
  }
];

const showrooms = [
  {
    id: "SR-061-01",
    region: "서울 성수",
    address: "서울 성동구 쇼룸로 21",
    hours: "10:30-20:00",
    style: "월넛 모던 거실"
  },
  {
    id: "SR-061-02",
    region: "경기 판교",
    address: "경기 성남시 분당구 리빙웨이 8",
    hours: "11:00-19:30",
    style: "샌드 내추럴 다이닝"
  },
  {
    id: "SR-061-03",
    region: "부산 해운대",
    address: "부산 해운대구 마린인테리어길 14",
    hours: "10:00-19:00",
    style: "차콜 시티 아파트"
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

  for (const filePath of requiredFiles) {
    const absolutePath = path.join(__dirname, filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Missing required file: ${filePath}`);
    }
  }

  const appJs = fs.readFileSync(path.join(publicDir, "app.js"), "utf8");
  const serverJs = fs.readFileSync(__filename, "utf8");
  new Function(appJs);
  new Function("require", "module", "__filename", "__dirname", serverJs);
  console.log("site061 build check passed");
}

if (process.argv.includes("--check")) {
  runBuildCheck();
  process.exit(0);
}

const app = express();

app.use(express.json());
app.use(express.static(publicDir));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    site: "site061",
    service: "walnut-room-showroom",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/furniture", (req, res) => {
  res.json({
    furniture,
    total: furniture.length,
    generatedAt: new Date().toISOString()
  });
});

app.get("/api/showrooms", (req, res) => {
  res.json({
    showrooms,
    total: showrooms.length,
    generatedAt: new Date().toISOString()
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`site061 Walnut Room running at http://localhost:${PORT}`);
});
