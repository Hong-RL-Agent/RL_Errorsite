const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 9297;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const campaigns = [
  {
    id: "education-bridge",
    title: "배움의 다리 교실",
    field: "교육",
    targetAmount: 100000000,
    currentAmount: 70000000,
    description:
      "도서산간 아동에게 방과 후 학습 공간, 교재, 온라인 멘토링을 연결하는 연간 캠페인입니다.",
    image: "/assets/campaign-education.svg",
    region: "강원, 전북",
    partner: "지역아동센터 18곳"
  },
  {
    id: "clean-water",
    title: "맑은 물 회복 프로젝트",
    field: "환경",
    targetAmount: 60000000,
    currentAmount: 42000000,
    description:
      "노후 급수 시설을 교체하고 지역 주민이 함께 관리하는 마을 단위 식수 개선 캠페인입니다.",
    image: "/assets/campaign-water.svg",
    region: "충남, 경북",
    partner: "마을 협동조합 7곳"
  },
  {
    id: "green-lunch",
    title: "초록 급식 꾸러미",
    field: "아동",
    targetAmount: 120000000,
    currentAmount: 195000000,
    description:
      "결식 우려 아동에게 지역 농산물 기반의 주말 식사 꾸러미와 영양 상담을 제공합니다.",
    image: "/assets/campaign-food.svg",
    region: "서울, 경기",
    partner: "푸드뱅크 네트워크"
  },
  {
    id: "safe-home",
    title: "긴급 안심 쉼터",
    field: "주거",
    targetAmount: 90000000,
    currentAmount: 55000000,
    description:
      "재난과 폭염에 취약한 가정에 임시 거처, 냉방 물품, 생활 회복 키트를 지원합니다.",
    image: "/assets/campaign-shelter.svg",
    region: "전국",
    partner: "재난대응 시민연대"
  },
  {
    id: "health-visit",
    title: "찾아가는 건강 버스",
    field: "보건",
    targetAmount: 110000000,
    currentAmount: 78000000,
    description:
      "의료 접근성이 낮은 지역을 순회하며 기초 검진, 상담, 복약 안내를 제공하는 이동 진료 캠페인입니다.",
    image: "/assets/campaign-health.svg",
    region: "전남, 충북",
    partner: "공공의료지원단"
  },
  {
    id: "youth-tech",
    title: "청소년 디지털 랩",
    field: "교육",
    targetAmount: 75000000,
    currentAmount: 30000000,
    description:
      "보호종료 청소년에게 노트북 대여, 코딩 워크숍, 포트폴리오 멘토링을 지원합니다.",
    image: "/assets/campaign-tech.svg",
    region: "부산, 대구",
    partner: "청년기술학교"
  }
];

const reports = [
  {
    id: "finance-2026-q1",
    title: "2026년 1분기 투명성 보고서",
    period: "2026.01 - 2026.03",
    summary: "모금액 8.4억 원 중 91.8%가 직접 사업비로 집행되었습니다.",
    downloadable: true,
    type: "finance"
  },
  {
    id: "field-2026-apr",
    title: "4월 현장 활동 브리프",
    period: "2026.04",
    summary: "식수 개선 3개 마을, 아동 식사 꾸러미 2,180개, 이동 진료 9회를 완료했습니다.",
    downloadable: true,
    type: "field"
  },
  {
    id: "impact-2026-spring",
    title: "봄 캠페인 성과 지표",
    period: "2026.03 - 2026.04",
    summary: "정기 약정 참여자 1,204명 증가, 평균 캠페인 달성률 72%를 기록했습니다.",
    downloadable: false,
    type: "impact"
  }
];

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    siteId: "site078",
    service: "online-donation-campaign",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/campaigns", (req, res) => {
  res.json({ campaigns });
});

app.get("/api/reports", (req, res) => {
  res.json({ reports });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`site078 donation campaign server running at http://localhost:${PORT}`);
});
