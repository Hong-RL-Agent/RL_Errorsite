const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 9305;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const instruments = [
  {
    id: "guitar-riverton-01",
    name: "Riverton Studio Classic ST",
    brand: "Riverton",
    type: "기타",
    price: 1280000,
    image: "/assets/guitar.svg",
    rating: 4.9,
    stockStatus: "available",
    recommended: true,
    beginnerRecommended: false,
    description: "알더 바디와 빈티지 싱글 코일 픽업을 조합한 스튜디오용 일렉트릭 기타입니다.",
    finish: "Tobacco Brown",
    origin: "USA Workshop"
  },
  {
    id: "piano-harmonia-02",
    name: "Harmonia H88 Stage Piano",
    brand: "Harmonia",
    type: "피아노",
    price: 1840000,
    image: "/assets/piano.svg",
    rating: 4.8,
    stockStatus: "available",
    recommended: true,
    beginnerRecommended: true,
    description: "해머 액션 건반과 클래식 그랜드 톤 샘플을 탑재한 88건반 스테이지 피아노입니다.",
    finish: "Matte Black",
    origin: "Korea"
  },
  {
    id: "sax-brassline-03",
    name: "Brassline Alto Sax A7",
    brand: "Brassline",
    type: "관악기",
    price: 970000,
    image: "/assets/saxophone.svg",
    rating: 4.6,
    stockStatus: "lowstock",
    recommended: false,
    beginnerRecommended: true,
    description: "따뜻한 중음역과 안정적인 키 액션을 제공하는 알토 색소폰 입문 추천 모델입니다.",
    finish: "Lacquer Gold",
    origin: "Taiwan"
  },
  {
    id: "mixer-noir-04",
    name: "NoirSound Compact Mixer 12",
    brand: "NoirSound",
    type: "음향 장비",
    price: 560000,
    image: "/assets/mixer.svg",
    rating: 4.5,
    stockStatus: "available",
    recommended: false,
    beginnerRecommended: false,
    description: "소규모 공연과 홈레코딩에 적합한 12채널 아날로그 믹서입니다.",
    finish: "Graphite Black",
    origin: "Germany"
  },
  {
    id: "violin-aurum-05",
    name: "Aurum Concert Violin V3",
    brand: "Aurum",
    type: "현악기",
    price: 730000,
    image: "/assets/violin.svg",
    rating: 4.7,
    stockStatus: "available",
    recommended: true,
    beginnerRecommended: true,
    description: "스프루스 상판과 메이플 측후판으로 제작된 균형 좋은 콘서트 바이올린입니다.",
    finish: "Amber Varnish",
    origin: "Czech Republic"
  },
  {
    id: "drum-cadence-06",
    name: "Cadence Birch Drum Shell Pack",
    brand: "Cadence",
    type: "드럼",
    price: 1490000,
    image: "/assets/drums.svg",
    rating: 4.4,
    stockStatus: "soldout",
    recommended: false,
    beginnerRecommended: false,
    description: "자작나무 쉘 특유의 선명한 어택을 가진 5기통 어쿠스틱 드럼 패키지입니다.",
    finish: "Deep Walnut",
    origin: "Japan"
  },
  {
    id: "guitar-coda-07",
    name: "Coda Folk Dreadnought D45",
    brand: "Coda",
    type: "기타",
    price: 620000,
    image: "/assets/acoustic.svg",
    rating: 4.5,
    stockStatus: "available",
    recommended: false,
    beginnerRecommended: true,
    description: "넓은 울림과 편안한 넥감으로 입문자와 싱어송라이터에게 어울리는 어쿠스틱 기타입니다.",
    finish: "Natural Gloss",
    origin: "Indonesia"
  },
  {
    id: "trumpet-brassline-08",
    name: "Brassline Trumpet T2",
    brand: "Brassline",
    type: "관악기",
    price: 520000,
    image: "/assets/trumpet.svg",
    rating: 4.3,
    stockStatus: "lowstock",
    recommended: false,
    beginnerRecommended: true,
    description: "반응성이 빠른 피스톤과 명료한 톤을 가진 입문용 트럼펫입니다.",
    finish: "Gold Lacquer",
    origin: "Taiwan"
  },
  {
    id: "monitor-noir-09",
    name: "NoirSound Reference Monitor M5",
    brand: "NoirSound",
    type: "음향 장비",
    price: 430000,
    image: "/assets/monitor.svg",
    rating: 4.6,
    stockStatus: "available",
    recommended: true,
    beginnerRecommended: false,
    description: "홈 스튜디오의 밸런스 확인에 적합한 5인치 액티브 레퍼런스 모니터입니다.",
    finish: "Satin Black",
    origin: "Germany"
  }
];

const brands = [
  {
    id: "brand-riverton",
    name: "Riverton",
    description: "빈티지 기타의 감성과 현대적인 세팅 안정성을 결합한 클래식 기타 브랜드입니다.",
    signatureInstrument: "일렉트릭 기타"
  },
  {
    id: "brand-harmonia",
    name: "Harmonia",
    description: "스테이지 피아노와 연습용 건반을 중심으로 정교한 터치감을 설계합니다.",
    signatureInstrument: "디지털 피아노"
  },
  {
    id: "brand-brassline",
    name: "Brassline",
    description: "학생용부터 공연용까지 안정적인 관악기 라인업을 제공하는 브라스 전문 브랜드입니다.",
    signatureInstrument: "색소폰"
  },
  {
    id: "brand-noirsound",
    name: "NoirSound",
    description: "작은 스튜디오를 위한 믹서, 모니터, 인터페이스를 만드는 음향 장비 브랜드입니다.",
    signatureInstrument: "스튜디오 모니터"
  },
  {
    id: "brand-aurum",
    name: "Aurum",
    description: "클래식 현악기의 따뜻한 울림과 수작업 마감에 집중합니다.",
    signatureInstrument: "바이올린"
  },
  {
    id: "brand-cadence",
    name: "Cadence",
    description: "재즈와 락 드러머를 위한 어쿠스틱 드럼 셸과 하드웨어를 제작합니다.",
    signatureInstrument: "드럼"
  },
  {
    id: "brand-coda",
    name: "Coda",
    description: "입문자도 편하게 연주할 수 있는 어쿠스틱 기타와 우쿨렐레를 선보입니다.",
    signatureInstrument: "어쿠스틱 기타"
  }
];

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    site: "site086",
    service: "Classic Instrument Shop",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/instruments", (req, res) => {
  res.json({
    instruments,
    count: instruments.length
  });
});

app.get("/api/brands", (req, res) => {
  res.json({
    brands,
    count: brands.length
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`site086 instrument shop running at http://localhost:${PORT}`);
});
