import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 9250;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const providers = [
  {
    id: "provider-greenpaw",
    name: "그린포우 동물병원",
    serviceType: "진료",
    region: "서울 마포구",
    rating: 4.9,
    distanceKm: 1.2,
    priceRange: "35,000원~",
    availableTimes: ["09:30", "11:00", "14:30", "17:00"],
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=900&q=80",
    petTypes: ["강아지", "고양이"],
    description: "건강검진, 피부 상담, 예방 케어를 한 번에 예약할 수 있는 지역 동물병원입니다."
  },
  {
    id: "provider-coralcut",
    name: "코랄펫 살롱",
    serviceType: "미용",
    region: "서울 성동구",
    rating: 4.8,
    distanceKm: 2.4,
    priceRange: "55,000원~",
    availableTimes: ["10:00", "13:00", "15:30", "18:30"],
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80",
    petTypes: ["강아지"],
    description: "견종별 컷, 스파, 발톱 케어를 제공하는 프리미엄 미용 스튜디오입니다."
  },
  {
    id: "provider-creamhotel",
    name: "크림하우스 펫호텔",
    serviceType: "호텔링",
    region: "경기 성남시",
    rating: 4.7,
    distanceKm: 8.1,
    priceRange: "42,000원~",
    availableTimes: ["08:00", "12:00", "16:00", "20:00"],
    image: "https://images.unsplash.com/photo-1601758063541-d2f50b4aafb2?auto=format&fit=crop&w=900&q=80",
    petTypes: ["강아지", "고양이"],
    description: "분리형 객실과 실시간 사진 리포트를 제공하는 안심 호텔링 서비스입니다."
  },
  {
    id: "provider-walkmint",
    name: "워크민트 산책팀",
    serviceType: "산책",
    region: "서울 강남구",
    rating: 4.6,
    distanceKm: 4.8,
    priceRange: "18,000원~",
    availableTimes: ["07:30", "12:30", "18:00", "21:00"],
    image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80",
    petTypes: ["강아지"],
    description: "산책 동선, 배변 기록, 컨디션 메모를 함께 제공하는 전문 산책 예약입니다."
  },
  {
    id: "provider-homecare",
    name: "포근방문 돌봄",
    serviceType: "방문 돌봄",
    region: "서울 은평구",
    rating: 4.9,
    distanceKm: 3.6,
    priceRange: "28,000원~",
    availableTimes: ["09:00", "13:30", "17:30", "20:30"],
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
    petTypes: ["고양이", "기타"],
    description: "급식, 화장실 정리, 놀이 시간을 포함한 고양이 중심 방문 돌봄입니다."
  },
  {
    id: "provider-vaxsage",
    name: "세이지 예방클리닉",
    serviceType: "예방접종",
    region: "서울 송파구",
    rating: 4.8,
    distanceKm: 6.2,
    priceRange: "30,000원~",
    availableTimes: ["10:30", "14:00", "16:30", "19:00"],
    image: "https://images.unsplash.com/photo-1606425271394-c3ca9aa1fc06?auto=format&fit=crop&w=900&q=80",
    petTypes: ["강아지", "고양이"],
    description: "종합백신, 심장사상충, 정기 접종 알림까지 연결되는 예방 케어 클리닉입니다."
  }
];

const pets = [
  { name: "몽이", type: "강아지", age: 4, note: "피부가 예민하고 낯선 사람에게 천천히 적응합니다." },
  { name: "루나", type: "고양이", age: 3, note: "방문 돌봄 선호, 낯선 소리에 민감합니다." },
  { name: "토리", type: "기타", age: 2, note: "짧은 이동과 조용한 환경이 필요합니다." }
];

const reviews = [
  { providerId: "provider-greenpaw", author: "하루 보호자", rating: 5, content: "진료 설명이 차분했고 예약 시간도 정확했어요.", date: "2026-04-29", petType: "강아지" },
  { providerId: "provider-coralcut", author: "콩이 보호자", rating: 4, content: "미용 결과가 깔끔하고 사진 안내가 좋았습니다.", date: "2026-04-22", petType: "강아지" },
  { providerId: "provider-homecare", author: "나비 보호자", rating: 5, content: "방문 리포트가 자세해서 여행 중에도 안심됐습니다.", date: "2026-04-27", petType: "고양이" },
  { providerId: "provider-vaxsage", author: "초코 보호자", rating: 5, content: "접종 후 주의사항까지 꼼꼼히 안내받았습니다.", date: "2026-04-18", petType: "고양이" }
];

app.get("/api/health", (req, res) => {
  res.json({ ok: true, site: "site031", service: "PawCare Desk", port: PORT });
});

app.get("/api/providers", (req, res) => {
  res.json({ providers });
});

app.get("/api/pets", (req, res) => {
  res.json({ pets });
});

app.get("/api/reviews", (req, res) => {
  res.json({ reviews });
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("/assets/*", (req, res) => {
  res.status(404).type("text/plain").send("Asset not found. Refresh the page to load the latest bundle.");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`site031 PawCare Desk running at http://localhost:${PORT}`);
});
