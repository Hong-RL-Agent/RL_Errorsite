const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 9271;
const publicDir = path.join(__dirname, "public");

const plans = [
  {
    id: "starter",
    name: "Starter Access",
    monthlyPrice: 69000,
    yearlyPrice: 690000,
    benefits: ["전 지점 자유 입장", "기본 체성분 측정 월 1회", "락커 30% 할인", "그룹 클래스 4회"],
    recommended: false
  },
  {
    id: "performance",
    name: "Performance Plus",
    monthlyPrice: 109000,
    yearlyPrice: 1090000,
    benefits: ["전 지점 24시간 입장", "그룹 클래스 무제한", "스마트 운동 기록", "락커 무료", "월 1회 트레이너 상담"],
    recommended: true
  },
  {
    id: "elite",
    name: "Elite Coaching",
    monthlyPrice: 179000,
    yearlyPrice: 1790000,
    benefits: ["프리미엄 라운지", "PT 2회 포함", "영양 코칭 리포트", "체형 분석 촬영", "동반 1인 체험권"],
    recommended: false
  }
];

const trainers = [
  {
    id: "trn-01",
    name: "강지훈",
    specialty: "근비대 · 프리웨이트",
    experience: "9년",
    rating: 4.9,
    image: "/assets/trainer-strength.svg",
    bio: "체형과 운동 경력에 맞춰 벤치프레스, 데드리프트, 스쿼트 기본기를 세밀하게 교정합니다."
  },
  {
    id: "trn-02",
    name: "서민아",
    specialty: "다이어트 · 바디프로필",
    experience: "7년",
    rating: 4.8,
    image: "/assets/trainer-cardio.svg",
    bio: "체지방 감량, 식단 루틴, 촬영 전 컨디션 조절을 단계별로 설계합니다."
  },
  {
    id: "trn-03",
    name: "오태준",
    specialty: "재활 · 코어 안정화",
    experience: "11년",
    rating: 4.9,
    image: "/assets/trainer-rehab.svg",
    bio: "허리와 어깨 부담을 줄이는 움직임 평가와 코어 안정화 루틴을 제공합니다."
  },
  {
    id: "trn-04",
    name: "이하린",
    specialty: "HIIT · 기능성 트레이닝",
    experience: "6년",
    rating: 4.7,
    image: "/assets/trainer-hiit.svg",
    bio: "짧은 시간에 심폐지구력과 전신 근력을 끌어올리는 고강도 프로그램을 진행합니다."
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
  console.log("site052 build check passed");
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
    site: "site052",
    service: "neonfit-membership",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/plans", (req, res) => {
  res.json({
    plans,
    total: plans.length,
    generatedAt: new Date().toISOString()
  });
});

app.get("/api/trainers", (req, res) => {
  res.json({
    trainers,
    total: trainers.length,
    generatedAt: new Date().toISOString()
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`site052 NeonFit running at http://localhost:${PORT}`);
});
