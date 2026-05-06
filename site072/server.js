const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9291;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const wines = [
  {
    id: 'w-101',
    name: 'Chateau Montclair Reserve',
    type: 'red',
    typeLabel: '레드',
    region: 'Bordeaux, France',
    regionLabel: '프랑스 보르도',
    vintage: '2018',
    image: '/assets/wine-red.svg',
    priceBand: 'premium',
    pairing: '등심 스테이크, 트러플 감자 그라탱',
    pairingLong: '블랙커런트와 토스트 향이 풍부해 미디엄 레어 스테이크와 숙성 치즈를 함께 즐기는 상담 구성에 적합합니다.',
    available: true,
    consultation: '셀러 보관 빈티지 비교 상담 가능'
  },
  {
    id: 'w-102',
    name: 'Aurum Valley Chardonnay',
    type: 'white',
    typeLabel: '화이트',
    region: 'Napa Valley, USA',
    regionLabel: '미국 나파 밸리',
    vintage: '2021',
    image: '/assets/wine-white.svg',
    priceBand: 'signature',
    pairing: '버터 소스 랍스터, 크림 파스타',
    pairingLong: '오크 숙성의 바닐라 톤과 산도가 균형을 이루어 풍성한 해산물 요리와 잘 어울립니다.',
    available: true,
    consultation: '선물용 포장 스타일 상담 가능'
  },
  {
    id: 'w-103',
    name: 'Serra Verde Gran Reserva',
    type: 'red',
    typeLabel: '레드',
    region: 'Rioja Alta, Spain',
    regionLabel: '스페인 리오하 알타',
    vintage: '2016',
    image: '/assets/wine-red-tall.svg',
    priceBand: 'collector',
    pairing: '양갈비, 파프리카 로스트',
    pairingLong: '가죽, 말린 체리, 스파이스 향이 천천히 열려 숙성 레드 입문 상담에 자주 추천됩니다.',
    available: true,
    consultation: '디캔팅 시간 안내 가능'
  },
  {
    id: 'w-104',
    name: 'Domaine Clairette Blanc',
    type: 'white',
    typeLabel: '화이트',
    region: 'Burgundy, France',
    regionLabel: '프랑스 부르고뉴',
    vintage: '2020',
    image: '/assets/wine-white.svg',
    priceBand: 'premium',
    pairing: '광어 카르파초, 레몬 버터 치킨',
    pairingLong: '미네랄리티와 섬세한 꽃 향이 살아 있어 산뜻한 코스 요리와 잘 맞습니다.',
    available: true,
    consultation: '코스 메뉴 페어링 상담 가능'
  },
  {
    id: 'w-105',
    name: 'Rosato di Alba Estate',
    type: 'rose',
    typeLabel: '로제',
    region: 'Piedmont, Italy',
    regionLabel: '이탈리아 피에몬테',
    vintage: '2022',
    image: '/assets/wine-rose.svg',
    priceBand: 'signature',
    pairing: '프로슈토, 딸기 샐러드',
    pairingLong: '밝은 베리 향과 은은한 허브 노트가 가벼운 브런치 테이블에 잘 어울립니다.',
    available: true,
    consultation: '시즌 한정 입고 일정 안내 가능'
  },
  {
    id: 'w-106',
    name: 'Cote d Or Heritage Pinot Noir',
    type: 'red',
    typeLabel: '레드',
    region: 'Cote de Nuits Premier Cru Heritage Vineyard, Burgundy, France',
    regionLabel: '프랑스 부르고뉴 코트 드 뉘 프리미에 크뤼 헤리티지 빈야드',
    vintage: '2019',
    image: '/assets/wine-red.svg',
    priceBand: 'collector',
    pairing: '오리 콩피와 산딸기 소스, 송로버섯 리조토, 숙성 브리, 허브 크러스트 포크 로인',
    pairingLong: 'VeryLongPairingDescriptorForOverflowTraining_PremierCruDuckConfitWithRaspberryReductionAndTruffleRisottoAndAgedBrieAndHerbCrustedPorkLoinServiceSuggestionWithoutNaturalBreaks',
    available: true,
    consultation: '프리미에 크뤼 비교 테이스팅 상담 가능'
  },
  {
    id: 'w-107',
    name: 'Luna Mare Sparkling Brut',
    type: 'sparkling',
    typeLabel: '스파클링',
    region: 'Veneto, Italy',
    regionLabel: '이탈리아 베네토',
    vintage: 'NV',
    image: '/assets/wine-sparkling.svg',
    priceBand: 'classic',
    pairing: '굴, 카나페, 과일 타르트',
    pairingLong: '섬세한 기포와 청사과 향이 리셉션이나 가벼운 기념일 상담에 적합합니다.',
    available: true,
    consultation: '행사 수량 상담 가능'
  },
  {
    id: 'w-108',
    name: 'Greenstone Riesling Kabinett',
    type: 'white',
    typeLabel: '화이트',
    region: 'Mosel, Germany',
    regionLabel: '독일 모젤',
    vintage: '2021',
    image: '/assets/wine-white.svg',
    priceBand: 'classic',
    pairing: '타이 커리, 과일 플래터',
    pairingLong: '은은한 단맛과 높은 산도가 매콤한 음식의 향을 정리해 줍니다.',
    available: false,
    consultation: '재입고 알림 상담 가능'
  }
];

const pairings = [
  {
    id: 'meat',
    category: '육류',
    recommendedType: '레드',
    description: '탄닌과 산도가 있는 레드는 스테이크, 양갈비, 오리 요리의 풍미를 또렷하게 받쳐줍니다.'
  },
  {
    id: 'seafood',
    category: '해산물',
    recommendedType: '화이트',
    description: '미네랄감 있는 화이트는 조개, 흰살생선, 버터 소스 해산물의 질감을 산뜻하게 정돈합니다.'
  },
  {
    id: 'celebration',
    category: '기념일',
    recommendedType: '스파클링',
    description: '섬세한 기포와 산뜻한 과실 향이 식전주, 케이크, 가벼운 핑거푸드와 잘 어울립니다.'
  },
  {
    id: 'brunch',
    category: '브런치',
    recommendedType: '로제',
    description: '로제는 샐러드, 과일, 가벼운 육가공품을 부담 없이 연결해 주는 다재다능한 선택입니다.'
  }
];

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: 'site072',
    service: 'premium-wine-guide',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/wines', (req, res) => {
  res.json({ items: wines });
});

app.get('/api/pairings', (req, res) => {
  res.json({ items: pairings });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`site072 wine guide running at http://localhost:${PORT}`);
});
