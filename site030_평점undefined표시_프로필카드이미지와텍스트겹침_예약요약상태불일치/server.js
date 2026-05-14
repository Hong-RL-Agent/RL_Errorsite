import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 9249;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const mentors = [
  {
    id: "mentor-lee",
    name: "이서윤",
    field: "Product Management",
    career: 12,
    rating: 4.9,
    pricePerHour: 89000,
    availableSlots: ["09:00", "13:30", "20:00"],
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    headline: "글로벌 SaaS 제품 전략과 PM 커리어 전환 전문"
  },
  {
    id: "mentor-kim",
    name: "김도현",
    field: "Frontend Engineering",
    career: 9,
    pricePerHour: 76000,
    availableSlots: ["10:00", "15:00", "19:30"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    headline: "React 아키텍처, 포트폴리오 리뷰, 기술 면접 코칭"
  },
  {
    id: "mentor-park",
    name: "박하린",
    field: "UX Research",
    career: 8,
    rating: 4.8,
    pricePerHour: 72000,
    availableSlots: ["11:00", "16:30", "21:00"],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
    headline: "사용자 리서치 설계, 인터뷰 분석, 포트폴리오 스토리텔링"
  },
  {
    id: "mentor-choi",
    name: "최민준",
    field: "Data Science",
    career: 11,
    rating: 4.7,
    pricePerHour: 82000,
    availableSlots: ["08:30", "14:00", "18:30"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    headline: "머신러닝 실무, 데이터 직무 이직, 프로젝트 설계"
  },
  {
    id: "mentor-jung",
    name: "정유나",
    field: "Career Coaching",
    career: 14,
    rating: 5.0,
    pricePerHour: 68000,
    availableSlots: ["12:00", "17:00", "22:00"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    headline: "이력서, 커리어 로드맵, 연봉 협상 상담"
  },
  {
    id: "mentor-han",
    name: "한지훈",
    field: "Startup Strategy",
    career: 10,
    rating: 4.6,
    pricePerHour: 94000,
    availableSlots: ["09:30", "13:00", "18:00"],
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
    headline: "초기 스타트업 GTM, 투자 피치덱, 사업 검증"
  }
];

const reviews = [
  {
    mentorId: "mentor-lee",
    author: "Jiwon",
    rating: 5,
    content: "막연했던 PM 전환 계획이 주차별 액션으로 정리됐어요.",
    date: "2026-04-24"
  },
  {
    mentorId: "mentor-kim",
    author: "Minseo",
    rating: 4,
    content: "프론트엔드 면접 질문을 실제 사례로 풀어줘서 도움이 됐습니다.",
    date: "2026-04-20"
  },
  {
    mentorId: "mentor-park",
    author: "Ara",
    rating: 5,
    content: "UX 포트폴리오의 문제 정의 흐름이 훨씬 명확해졌습니다.",
    date: "2026-04-28"
  },
  {
    mentorId: "mentor-jung",
    author: "Leo",
    rating: 5,
    content: "이직 면담 전에 꼭 필요한 현실적인 피드백을 받았습니다.",
    date: "2026-04-18"
  }
];

app.get("/api/health", (req, res) => {
  res.json({ ok: true, site: "site030", service: "MentorLink", port: PORT });
});

app.get("/api/mentors", (req, res) => {
  res.json({ mentors });
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
  console.log(`site030 MentorLink running at http://localhost:${PORT}`);
});
