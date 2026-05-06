const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 9266;
const publicDir = path.join(__dirname, "public");

const events = [
  {
    id: "EVT-047-01",
    name: "달빛 개막 퍼레이드",
    date: "2026-06-12",
    time: "19:00-20:30",
    place: "해솔광장 메인거리",
    venue: "plaza",
    region: "center",
    category: "공연",
    image: "/assets/event-parade.svg",
    crowdLevel: "매우 혼잡"
  },
  {
    id: "EVT-047-02",
    name: "오렌지 노을 재즈 스테이지",
    date: "2026-06-12",
    time: "20:40-22:00",
    place: "선셋리버 야외무대",
    venue: "river",
    region: "river",
    category: "공연",
    image: "/assets/event-stage.svg",
    crowdLevel: "혼잡"
  },
  {
    id: "EVT-047-03",
    name: "해솔 로컬푸드 밤시장",
    date: "2026-06-12",
    time: "17:00-23:00",
    place: "중앙시장 문화로",
    venue: "market",
    region: "market",
    category: "먹거리",
    image: "/assets/event-market.svg",
    crowdLevel: "혼잡"
  },
  {
    id: "EVT-047-04",
    name: "가족 연등 만들기",
    date: "2026-06-13",
    time: "10:00-12:00",
    place: "문화예술회관 로비",
    venue: "arts",
    region: "center",
    category: "체험",
    image: "/assets/event-workshop.svg",
    crowdLevel: "보통"
  },
  {
    id: "EVT-047-05",
    name: "풍물 탈춤 한마당",
    date: "2026-06-13",
    time: "14:00-15:30",
    place: "해솔광장 전통무대",
    venue: "plaza",
    region: "center",
    category: "전통",
    image: "/assets/event-stage.svg",
    crowdLevel: "보통"
  },
  {
    id: "EVT-047-06",
    name: "강변 피크닉 버스킹",
    date: "2026-06-13",
    time: "16:00-18:00",
    place: "선셋리버 잔디마당",
    venue: "river",
    region: "river",
    category: "가족",
    image: "/assets/event-river.svg",
    crowdLevel: "여유"
  },
  {
    id: "EVT-047-07",
    name: "청년 메이커 공방 투어",
    date: "2026-06-14",
    time: "11:00-13:00",
    place: "동문창작소",
    venue: "studio",
    region: "east",
    category: "체험",
    image: "/assets/event-workshop.svg",
    crowdLevel: "보통"
  },
  {
    id: "EVT-047-08",
    name: "바다빛 미디어 파사드",
    date: "2026-06-14",
    time: "19:30-21:30",
    place: "항구전망대 외벽",
    venue: "harbor",
    region: "harbor",
    category: "야간",
    image: "/assets/event-harbor.svg",
    crowdLevel: "혼잡"
  },
  {
    id: "EVT-047-09",
    name: "해솔 맛길 셰프 시연",
    date: "2026-06-14",
    time: "15:00-16:30",
    place: "중앙시장 쿠킹돔",
    venue: "market",
    region: "market",
    category: "먹거리",
    image: "/assets/event-market.svg",
    crowdLevel: "매우 혼잡"
  },
  {
    id: "EVT-047-10",
    name: "어르신 합창 피날레",
    date: "2026-06-15",
    time: "13:00-14:00",
    place: "문화예술회관 대극장",
    venue: "arts",
    region: "center",
    category: "공연",
    image: "/assets/event-stage.svg",
    crowdLevel: "보통"
  },
  {
    id: "EVT-047-11",
    name: "어린이 물빛 놀이터",
    date: "2026-06-15",
    time: "10:00-17:00",
    place: "해솔 수변공원",
    venue: "river",
    region: "river",
    category: "가족",
    image: "/assets/event-river.svg",
    crowdLevel: "여유"
  },
  {
    id: "EVT-047-12",
    name: "폐막 불꽃과 드론쇼",
    date: "2026-06-15",
    time: "21:00-21:25",
    place: "항구전망대",
    venue: "harbor",
    region: "harbor",
    category: "야간",
    image: "/assets/event-harbor.svg",
    crowdLevel: "매우 혼잡"
  }
];

const notices = [
  {
    id: "NOTICE-047-01",
    title: "축제 기간 순환 셔틀버스 10분 간격 운행",
    content: "해솔역 2번 출구와 해솔광장, 항구전망대를 잇는 무료 순환 셔틀이 10분 간격으로 운행됩니다.",
    createdAt: "2026-05-28"
  },
  {
    id: "NOTICE-047-02",
    title: "우천 시 야외 공연장 일부 변경 안내",
    content: "강수 예보가 있는 시간대에는 선셋리버 야외무대 공연이 문화예술회관 대극장으로 이동될 수 있습니다.",
    createdAt: "2026-05-30"
  },
  {
    id: "NOTICE-047-03",
    title: "로컬푸드 밤시장 다회용기 이용 캠페인",
    content: "중앙시장 문화로 안내부스에서 다회용기 대여와 반납을 지원합니다. 반납 시 지역 쿠폰을 받을 수 있습니다.",
    createdAt: "2026-06-01"
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
  console.log("site047 build check passed");
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
    site: "site047",
    service: "haesol-festival-guide",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/events", (req, res) => {
  res.json({
    events,
    total: events.length,
    generatedAt: new Date().toISOString()
  });
});

app.get("/api/notices", (req, res) => {
  res.json({
    notices,
    total: notices.length,
    generatedAt: new Date().toISOString()
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`site047 festival guide running at http://localhost:${PORT}`);
});
