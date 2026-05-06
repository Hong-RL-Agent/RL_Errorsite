const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9262;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const encodeSvg = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const artworkImage = (title, artist, palette, motif) => {
  const [bg, block, line, accent] = palette;
  return encodeSvg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900" role="img" aria-label="${title}">
    <rect width="720" height="900" fill="${bg}"/>
    <rect x="70" y="72" width="580" height="756" fill="#fffdf7" opacity="0.82"/>
    <rect x="112" y="116" width="496" height="628" fill="${block}"/>
    <path d="${motif}" fill="none" stroke="${line}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"/>
    <circle cx="514" cy="242" r="66" fill="${accent}" opacity="0.88"/>
    <rect x="150" y="642" width="420" height="36" fill="${accent}" opacity="0.7"/>
    <text x="360" y="792" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#2a2621">${title}</text>
    <text x="360" y="828" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#766f65">${artist}</text>
  </svg>`);
};

const profileImage = (name, bg, accent) => encodeSvg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-label="${name}">
    <rect width="320" height="320" fill="${bg}"/>
    <circle cx="160" cy="126" r="58" fill="${accent}"/>
    <path d="M72 282c19-58 56-88 88-88s69 30 88 88" fill="#fff8ec" opacity="0.88"/>
    <text x="160" y="56" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#fff8ec">${name}</text>
  </svg>`);

const artists = [
  {
    id: 301,
    name: '윤서하',
    intro: '한지와 흑연을 겹쳐 도시의 사라지는 빛을 기록하는 작가. 단정한 여백 위에 금박 선을 얹는 작업으로 알려져 있습니다.',
    signatureWork: 'Nocturne Layer 07',
    profileImage: profileImage('Yoon Seoha', '#302a24', '#c6a15b'),
    exhibitionHistory: ['2026 Light Archive, Atelier Veyron', '2025 Paper Latitude, Busan Art Week', '2024 Window of Dust, Seoul']
  },
  {
    id: 302,
    name: '문라온',
    intro: '세라믹 안료와 아크릴을 섞어 정물의 표면을 재구성합니다. 크림색 바탕과 차콜 라인이 충돌하는 화면을 만듭니다.',
    signatureWork: 'Quiet Vessel',
    profileImage: profileImage('Moon Raon', '#6c6256', '#e7d5af'),
    exhibitionHistory: ['2026 Object Room, Atelier Veyron', '2025 Still Forms, Daegu', '2023 Young Collector Preview']
  },
  {
    id: 303,
    name: 'Kira Han',
    intro: '유리, 반사 필름, 디지털 프린트를 결합해 전시장 동선과 관람자의 움직임을 이미지로 번역합니다.',
    signatureWork: 'Mirror Index',
    profileImage: profileImage('Kira Han', '#1f2427', '#d4a94d'),
    exhibitionHistory: ['2026 Afterimage Route, Atelier Veyron', '2025 Glass Notes, Tokyo', '2024 Index Room, Seoul']
  },
  {
    id: 304,
    name: '정이든',
    intro: '목탄 드로잉과 오일 파스텔을 통해 오래된 정원의 구조와 계절감을 추상적으로 압축합니다.',
    signatureWork: 'Garden Draft',
    profileImage: profileImage('Jung Eden', '#3f332b', '#c9b182'),
    exhibitionHistory: ['2026 Slow Garden, Atelier Veyron', '2025 Drawing Fair Seoul', '2024 Surface Walk']
  }
];

const artworks = [
  {
    id: 'art-101',
    title: 'Nocturne Layer 07',
    artistId: 301,
    year: 2026,
    material: '한지에 흑연, 금박',
    category: 'painting',
    image: artworkImage('Nocturne Layer 07', 'Yoon Seoha', ['#f6f1e7', '#24211e', '#d1a94d', '#f2dfb0'], 'M180 196 C290 260 255 392 394 438 S540 592 424 678'),
    inquiryAvailable: true,
    priceRange: 'KRW 8,000,000 - 12,000,000'
  },
  {
    id: 'art-102',
    title: 'Quiet Vessel',
    artistId: 302,
    year: 2025,
    material: '캔버스에 아크릴, 세라믹 안료',
    category: 'mixed',
    image: artworkImage('Quiet Vessel', 'Moon Raon', ['#f8f4eb', '#dfd0ba', '#3f3933', '#b89149'], 'M238 190 C170 304 210 478 318 596 C432 472 560 360 478 214'),
    inquiryAvailable: true,
    priceRange: 'KRW 5,500,000 - 7,000,000'
  },
  {
    id: 'art-103',
    title: 'Mirror Index',
    artistId: '303',
    year: 2026,
    material: '유리, 반사 필름, 디지털 프린트',
    category: 'installation',
    image: artworkImage('Mirror Index', 'Kira Han', ['#f5efe3', '#202528', '#caa253', '#ece4d0'], 'M178 640 L292 190 L392 640 L516 190'),
    inquiryAvailable: true,
    priceRange: '가격 별도 문의'
  },
  {
    id: 'art-104',
    title: 'Garden Draft',
    artistId: 304,
    year: 2024,
    material: '종이에 목탄, 오일 파스텔',
    category: 'drawing',
    image: artworkImage('Garden Draft', 'Jung Eden', ['#f7f0e3', '#514236', '#d8b465', '#efe0bf'], 'M170 578 C260 480 224 314 360 248 C460 196 548 290 506 416 C472 518 360 590 244 670'),
    inquiryAvailable: true,
    priceRange: 'KRW 3,800,000 - 4,400,000'
  },
  {
    id: 'art-105',
    title: 'Paper Latitude',
    artistId: 301,
    year: 2025,
    material: '장지에 먹, 금분',
    category: 'painting',
    image: artworkImage('Paper Latitude', 'Yoon Seoha', ['#fbf7ee', '#e8ddc9', '#1f1c19', '#c9a64f'], 'M150 310 C254 226 344 404 446 320 S556 404 498 552 C448 690 246 630 190 708'),
    inquiryAvailable: true,
    priceRange: 'KRW 6,200,000 - 8,300,000'
  },
  {
    id: 'art-106',
    title: 'Object Room 12',
    artistId: 302,
    year: 2026,
    material: '패널에 혼합재료',
    category: 'mixed',
    image: artworkImage('Object Room 12', 'Moon Raon', ['#f4eddf', '#2e2a25', '#dfc48e', '#ffffff'], 'M190 260 H512 V382 H190 Z M252 448 H448 V620 H252 Z'),
    inquiryAvailable: true,
    priceRange: 'KRW 4,900,000 - 6,100,000'
  },
  {
    id: 'art-107',
    title: 'Afterimage Route',
    artistId: 303,
    year: 2026,
    material: '아카이벌 프린트, 알루미늄',
    category: 'photography',
    image: artworkImage('Afterimage Route', 'Kira Han', ['#f8f2e8', '#d9d3c9', '#24282b', '#c7a053'], 'M188 226 L512 226 M188 348 L512 348 M188 470 L512 470 M188 592 L512 592'),
    inquiryAvailable: true,
    priceRange: 'KRW 2,900,000 - 3,600,000'
  },
  {
    id: 'art-108',
    title: 'Slow Garden',
    artistId: 304,
    year: 2025,
    material: '캔버스에 목탄, 유채',
    category: 'drawing',
    image: artworkImage('Slow Garden', 'Jung Eden', ['#faf5e9', '#efe1c8', '#5a493c', '#c8a95d'], 'M160 580 C260 210 438 206 550 580 M226 612 C340 454 404 454 488 612'),
    inquiryAvailable: false,
    priceRange: '예약 중'
  }
];

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'site043 online gallery commerce',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/artworks', (req, res) => {
  res.json({ artworks });
});

app.get('/api/artists', (req, res) => {
  res.json({ artists });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`site043 server running at http://localhost:${PORT}`);
});
