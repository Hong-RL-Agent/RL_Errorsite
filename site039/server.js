const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9258;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const svgVehicle = (body, accent, label) => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="420" height="220" viewBox="0 0 420 220" role="img" aria-label="${label}">
    <rect width="420" height="220" rx="22" fill="#f4f4f1"/>
    <path d="M71 128c8-33 25-55 48-66h156c25 12 46 34 62 66h27c13 0 24 11 24 24v17H32v-17c0-13 10-24 24-24h15z" fill="${body}"/>
    <path d="M137 73h122c17 10 31 28 42 55H96c8-25 22-43 41-55z" fill="#ffffff"/>
    <path d="M153 86h48v31h-68c4-13 11-23 20-31zm67 0h32c10 7 20 18 28 31h-60V86z" fill="#1d1d1f"/>
    <rect x="53" y="145" width="317" height="23" rx="11" fill="${accent}"/>
    <circle cx="107" cy="169" r="27" fill="#111111"/>
    <circle cx="107" cy="169" r="11" fill="#f7c948"/>
    <circle cx="304" cy="169" r="27" fill="#111111"/>
    <circle cx="304" cy="169" r="11" fill="#f7c948"/>
    <rect x="182" y="45" width="78" height="24" rx="8" fill="#111111"/>
    <text x="221" y="62" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#ffd43b" font-weight="700">${label}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const vehicles = [
  {
    id: 'standard',
    name: '스탠다드 택시',
    seats: 4,
    baseFare: 37000,
    arrivalMinutes: 7,
    luggage: '캐리어 2개',
    badge: '가장 빠른 배차',
    image: svgVehicle('#ffd43b', '#111111', 'STANDARD')
  },
  {
    id: 'business',
    name: '비즈니스 세단',
    seats: 4,
    baseFare: 52000,
    arrivalMinutes: 11,
    luggage: '캐리어 3개',
    badge: '의전 추천',
    image: svgVehicle('#111111', '#ffd43b', 'BUSINESS')
  },
  {
    id: 'van',
    name: '공항 밴',
    seats: 7,
    baseFare: 68000,
    arrivalMinutes: 14,
    luggage: '캐리어 6개',
    badge: '단체 이동',
    image: svgVehicle('#f1f3f5', '#ffd43b', 'AIR VAN')
  },
  {
    id: 'shuttle',
    name: '예약 셔틀',
    seats: 11,
    baseFare: 84000,
    arrivalMinutes: 22,
    luggage: '대형 수하물',
    badge: '기업 계약',
    image: svgVehicle('#ffec99', '#111111', 'SHUTTLE')
  }
];

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'site039 mobility booking',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/vehicles', (req, res) => {
  res.json({ vehicles });
});

app.get('/api/fare-estimate', (req, res) => {
  const vehicle = vehicles.find((item) => item.id === req.query.vehicleId) || vehicles[0];
  const distanceKm = Number(req.query.distanceKm || 63.5);
  const estimatedMinutes = Math.round(distanceKm * 1.35 + vehicle.arrivalMinutes);
  const distanceFare = Math.round(distanceKm * 920);
  const airportToll = 6600;
  const serviceFee = vehicle.id === 'shuttle' ? 7000 : 4500;
  const surcharge = vehicle.id === 'business' ? 9600 : vehicle.id === 'van' ? 12800 : vehicle.id === 'shuttle' ? 15500 : 5200;
  const total = vehicle.baseFare + distanceFare + airportToll + serviceFee + surcharge;

  res.json({
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    distanceKm,
    estimatedMinutes,
    baseFare: vehicle.baseFare,
    distanceFare,
    airportToll,
    serviceFee,
    surcharge,
    total,
    currency: 'KRW'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`site039 server running at http://localhost:${PORT}`);
});
