const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 9265;

const products = [
  {
    id: "p-101",
    name: "하늘하늘 반투명 체크 노트 세트",
    category: "notebook",
    categoryLabel: "노트/메모",
    brand: "Paper Cloud",
    price: 6800,
    colors: ["sky", "cream", "mint"],
    image: "/assets/notebook.svg",
    stock: "in_stock",
    stockLabel: "재고 여유",
    best: true,
    rating: 4.8,
    description: "새학기 필기와 다이어리 꾸미기에 좋은 3권 구성 체크 노트입니다."
  },
  {
    id: "p-102",
    name: "파스텔 젤펜 10색 틴케이스",
    category: "pen",
    categoryLabel: "펜/필기구",
    brand: "Mild Dot",
    price: 12400,
    colors: ["blue", "pink", "yellow", "lavender"],
    image: "/assets/gelpen.svg",
    stock: "in_stock",
    stockLabel: "바로 발송",
    best: true,
    rating: 4.9,
    description: "번짐이 적은 0.5mm 젤펜 세트로 필기, 플래너, 엽서 꾸미기에 잘 어울립니다."
  },
  {
    id: "p-103",
    name: "데스크 위클리 플래너 A4",
    category: "planner",
    categoryLabel: "플래너",
    brand: "Desk Hug",
    price: 9300,
    colors: ["cream", "sky", "yellow"],
    image: "/assets/planner.svg",
    stock: "low_stock",
    stockLabel: "재고 5개",
    best: true,
    rating: 4.7,
    description: "책상에 펼쳐두기 좋은 A4 사이즈 주간 계획 패드입니다."
  },
  {
    id: "p-104",
    name: "토끼 모양 점착 메모지 4종",
    category: "memo",
    categoryLabel: "스티커/메모",
    brand: "Bunny Note",
    price: 4200,
    colors: ["pink", "cream", "mint"],
    image: "/assets/sticky-note.svg",
    stock: "in_stock",
    stockLabel: "재고 여유",
    best: false,
    rating: 4.6,
    description: "책갈피처럼 붙일 수 있는 귀여운 점착 메모지 4종 묶음입니다."
  },
  {
    id: "p-105",
    name: "크림 블루 펜슬 파우치",
    category: "case",
    categoryLabel: "파우치/보관",
    brand: "Soft Pocket",
    price: 15800,
    colors: ["cream", "blue"],
    image: "/assets/pouch.svg",
    stock: "in_stock",
    stockLabel: "바로 발송",
    best: true,
    rating: 4.8,
    description: "펜 18자루와 작은 자, 수정테이프까지 들어가는 가벼운 패브릭 파우치입니다."
  },
  {
    id: "p-106",
    name: "새학기 데스크 정리 올인원 문구 스타터 키트 라이트블루 에디션 노트 펜 메모 플래너 구성",
    category: "set",
    categoryLabel: "세트상품",
    brand: "Start Kit Lab",
    price: 28900,
    colors: ["sky", "cream", "yellow", "mint"],
    image: "/assets/starter-kit.svg",
    stock: "in_stock",
    stockLabel: "재고 여유",
    best: false,
    rating: 4.5,
    description: "노트, 펜, 메모지, 플래너, 스티커를 한 번에 준비할 수 있는 문구 세트입니다."
  },
  {
    id: "p-107",
    name: "마스킹테이프 스쿨 팔레트 6롤",
    category: "deco",
    categoryLabel: "꾸미기",
    brand: "Tape Picnic",
    price: 7700,
    colors: ["blue", "yellow", "mint", "pink"],
    image: "/assets/tape.svg",
    stock: "in_stock",
    stockLabel: "재고 여유",
    best: false,
    rating: 4.4,
    description: "노트 가장자리와 플래너 날짜칸에 포인트를 주기 좋은 6롤 구성입니다."
  },
  {
    id: "p-108",
    name: "라이트옐로우 계산기",
    category: "desk",
    categoryLabel: "데스크용품",
    brand: "Tiny Office",
    price: 11600,
    colors: ["yellow", "cream"],
    image: "/assets/calculator.svg",
    stock: "low_stock",
    stockLabel: "재고 3개",
    best: false,
    rating: 4.3,
    description: "작은 책상에도 놓기 쉬운 부드러운 키감의 파스텔 계산기입니다."
  },
  {
    id: "p-109",
    name: "클립 앤 북마크 믹스팩",
    category: "desk",
    categoryLabel: "데스크용품",
    brand: "Clip Studio",
    price: 3900,
    colors: ["sky", "pink", "yellow"],
    image: "/assets/clips.svg",
    stock: "in_stock",
    stockLabel: "바로 발송",
    best: false,
    rating: 4.6,
    description: "프린트물, 교재, 독서 기록을 깔끔하게 정리하는 컬러 클립 세트입니다."
  },
  {
    id: "p-110",
    name: "스프링 단어장 미니 5권팩",
    category: "notebook",
    categoryLabel: "노트/메모",
    brand: "Study Loop",
    price: 5500,
    colors: ["blue", "cream", "yellow"],
    image: "/assets/vocab.svg",
    stock: "in_stock",
    stockLabel: "재고 여유",
    best: false,
    rating: 4.5,
    description: "가방 앞주머니에 넣기 좋은 미니 단어장 5권 세트입니다."
  },
  {
    id: "p-111",
    name: "민트 수정테이프 리필 세트",
    category: "pen",
    categoryLabel: "펜/필기구",
    brand: "Clean Line",
    price: 6200,
    colors: ["mint", "cream"],
    image: "/assets/correction-tape.svg",
    stock: "sold_out",
    stockLabel: "일시 품절",
    best: false,
    rating: 4.2,
    description: "필기 실수를 깔끔하게 정리하는 리필형 수정테이프 세트입니다."
  }
];

const reviews = [
  {
    productId: "p-101",
    author: "다이어리초보",
    rating: 5,
    content: "종이가 도톰해서 젤펜도 깔끔하게 써져요. 표지 색감이 사진보다 더 부드럽습니다.",
    date: "2026-04-28"
  },
  {
    productId: "p-102",
    author: "필기왕",
    rating: 5,
    content: "케이스가 튼튼해서 책가방에 넣고 다니기 좋아요. 색이 전부 실사용 가능한 톤입니다.",
    date: "2026-04-26"
  },
  {
    productId: "p-103",
    author: "월요일정리",
    rating: 4,
    content: "업무랑 학교 과제를 같이 정리하기 편해요. 위쪽 여백도 넉넉합니다.",
    date: "2026-04-24"
  },
  {
    productId: "p-105",
    author: "연필깎이",
    rating: 5,
    content: "파우치 입구가 크게 열려서 안에 든 펜이 한눈에 보여요.",
    date: "2026-04-22"
  }
];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    siteId: "site046",
    service: "stationery-shop",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/products", (req, res) => {
  res.json({
    products,
    total: products.length,
    currency: "KRW"
  });
});

app.get("/api/reviews", (req, res) => {
  res.json({
    reviews,
    total: reviews.length
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (process.argv.includes("--check")) {
  const requiredFiles = [
    "public/index.html",
    "public/styles.css",
    "public/app.js",
    "README.md",
    "BUGS.md",
    "TODO.md"
  ];
  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(__dirname, file)));
  if (missing.length > 0) {
    console.error(`Missing required files: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log("site046 build check passed");
} else {
  app.listen(PORT, () => {
    console.log(`site046 stationery shop running at http://localhost:${PORT}`);
  });
}
