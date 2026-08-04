const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 9274;
const publicDir = path.join(__dirname, "public");

const flowers = [
  {
    id: "FL-055-01",
    name: "로즈 모닝 부케",
    purpose: "생일",
    price: 59000,
    image: "/assets/flower-rose.svg",
    deliveryAvailable: true,
    recommended: true
  },
  {
    id: "FL-055-02",
    name: "세이지 화이트 리스",
    purpose: "집들이",
    price: 72000,
    image: "/assets/flower-sage.svg",
    deliveryAvailable: true,
    recommended: false
  },
  {
    id: "FL-055-03",
    name: "피오니 크림 바스켓",
    purpose: "기념일",
    price: 89000,
    image: "/assets/flower-peony.svg",
    deliveryAvailable: true,
    recommended: true
  },
  {
    id: "FL-055-04",
    name: "튤립 선데이 박스",
    purpose: "응원",
    price: 43000,
    image: "/assets/flower-tulip.svg",
    deliveryAvailable: true,
    recommended: false
  },
  {
    id: "FL-055-05",
    name: "오늘의 로맨스 꽃다발",
    purpose: "기념일",
    price: 68000,
    image: "/assets/flower-romance.svg",
    deliveryAvailable: true,
    recommended: true
  },
  {
    id: "FL-055-06",
    name: "라벤더 허브 믹스",
    purpose: "위로",
    price: 52000,
    image: "/assets/flower-lavender.svg",
    deliveryAvailable: false,
    recommended: false
  },
  {
    id: "FL-055-07",
    name: "코랄 감사 센터피스",
    purpose: "감사",
    price: 96000,
    image: "/assets/flower-coral.svg",
    deliveryAvailable: true,
    recommended: false
  },
  {
    id: "FL-055-08",
    name: "미니 데이지 컵",
    purpose: "응원",
    price: 32000,
    image: "/assets/flower-daisy.svg",
    deliveryAvailable: true,
    recommended: true
  }
];

const deliveryOptions = [
  {
    id: "standard",
    name: "일반 배송",
    extraCost: 3000,
    eta: "내일 도착"
  },
  {
    id: "today",
    name: "오늘 배송",
    extraCost: 9000,
    eta: "오늘 18:00 전"
  },
  {
    id: "morning",
    name: "오전 지정 배송",
    extraCost: 12000,
    eta: "선택일 오전 10:00 전"
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
  console.log("site055 build check passed");
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
    site: "site055",
    service: "bloomlane-flower-shop",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/flowers", (req, res) => {
  res.json({
    flowers,
    total: flowers.length,
    generatedAt: new Date().toISOString()
  });
});

app.get("/api/delivery-options", (req, res) => {
  res.json({
    deliveryOptions,
    total: deliveryOptions.length,
    generatedAt: new Date().toISOString()
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`site055 BloomLane running at http://localhost:${PORT}`);
});
