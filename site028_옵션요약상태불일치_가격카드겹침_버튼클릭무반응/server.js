import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9247;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const cars = [
  {
    id: 1, model: 'Hyundai Sonata', brand: 'Hyundai',
    type: '중형', fuel: '가솔린', seats: 5,
    dailyRate: 45000, branch: '강남점', available: true,
    rating: 4.5, reviews: 128,
    features: ['블루투스', '후방카메라', '크루즈컨트롤']
  },
  {
    id: 2, model: 'Kia Sorento', brand: 'Kia',
    type: 'SUV', fuel: '디젤', seats: 7,
    dailyRate: 65000, branch: '홍대점', available: true,
    rating: 4.7, reviews: 95,
    features: ['7인승', 'AWD', '파노라믹선루프', '스마트크루즈']
  },
  {
    id: 3, model: 'Genesis G80', brand: 'Genesis',
    type: '럭셔리', fuel: '가솔린', seats: 5,
    dailyRate: 120000, branch: '강남점', available: true,
    rating: 4.9, reviews: 67,
    features: ['마사지시트', '내비게이션', 'HUD', '뱅앤올룹센']
  },
  {
    id: 4, model: 'Tesla Model 3', brand: 'Tesla',
    type: '중형', fuel: '전기', seats: 5,
    dailyRate: 80000, branch: '판교점', available: true,
    rating: 4.8, reviews: 156,
    features: ['오토파일럿', '수퍼차저', '15인치터치스크린']
  },
  {
    id: 5, model: 'Toyota RAV4', brand: 'Toyota',
    type: 'SUV', fuel: '하이브리드', seats: 5,
    dailyRate: 70000, branch: '서울역점', available: false,
    rating: 4.6, reviews: 89,
    features: ['하이브리드', 'AWD', '안전거리유지']
  },
  {
    id: 6, model: 'BMW 5 Series', brand: 'BMW',
    type: '럭셔리', fuel: '가솔린', seats: 5,
    dailyRate: 150000, branch: '강남점', available: true,
    rating: 4.8, reviews: 43,
    features: ['iDrive', '시트통풍', '레이저라이트', '주차어시스트']
  },
  {
    id: 7, model: 'Hyundai Casper', brand: 'Hyundai',
    type: '소형', fuel: '가솔린', seats: 4,
    dailyRate: 30000, branch: '홍대점', available: true,
    rating: 4.3, reviews: 201,
    features: ['경차', '연비우수', '주차편의']
  },
  {
    id: 8, model: 'Kia K9', brand: 'Kia',
    type: '대형', fuel: '가솔린', seats: 5,
    dailyRate: 95000, branch: '강남점', available: true,
    rating: 4.7, reviews: 38,
    features: ['플래그십세단', '에르고모션시트', '스카이사운드']
  },
  {
    id: 9, model: 'Audi Q5', brand: 'Audi',
    type: 'SUV', fuel: '디젤', seats: 5,
    dailyRate: 110000, branch: '판교점', available: true,
    rating: 4.6, reviews: 72,
    features: ['콰트로AWD', 'MMI네비', '어시스트패키지']
  },
  {
    id: 10, model: 'Mercedes C-Class', brand: 'Mercedes',
    type: '럭셔리', fuel: '가솔린', seats: 5,
    dailyRate: 140000, branch: '서울역점', available: true,
    rating: 4.9, reviews: 54,
    features: ['MBUX', '에어매틱', '부메스터사운드']
  },
  {
    id: 11, model: 'Volkswagen Golf', brand: 'VW',
    type: '소형', fuel: '가솔린', seats: 5,
    dailyRate: 38000, branch: '홍대점', available: true,
    rating: 4.4, reviews: 167,
    features: ['DSG변속기', '디지털콕핏', '레인센서']
  },
  {
    id: 12, model: 'Hyundai Tucson', brand: 'Hyundai',
    type: 'SUV', fuel: '하이브리드', seats: 5,
    dailyRate: 75000, branch: '판교점', available: true,
    rating: 4.5, reviews: 112,
    features: ['하이브리드', '파노라마선루프', 'HTRAC']
  }
];

const insuranceOptions = [
  {
    id: 1,
    name: '기본 보장',
    price: 0,
    coverage: ['대인 책임 기본', '대물 책임 기본 (2천만원)'],
    description: '법정 필수 보험만 포함한 경제형 플랜',
    recommended: false,
    color: '#6c757d'
  },
  {
    id: 2,
    name: '일반 보장',
    price: 10000,
    coverage: ['대인 책임', '대물 책임 (1억원)', '자기차량 손해 보장', '긴급출동 서비스 (월 2회)'],
    description: '일반 운전자를 위한 균형 잡힌 보장 플랜',
    recommended: false,
    color: '#1B2A4A'
  },
  {
    id: 3,
    name: '프리미엄 보장',
    price: 20000,
    coverage: [
      '완전 면책 (자기부담금 0원)',
      '대인/대물 무제한 보장',
      '긴급출동 무제한',
      '렌터카 손해 면제 특약',
      '개인 상해 보험 포함'
    ],
    description: '완전한 보호를 원하는 분들을 위한 올인원 플랜',
    recommended: true,
    color: '#F5C518'
  }
];

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'site028-premiride',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/api/cars', (req, res) => {
  const { type, fuel } = req.query;
  let filtered = [...cars];
  if (type && type !== '전체') filtered = filtered.filter(c => c.type === type);
  if (fuel && fuel !== '전체') filtered = filtered.filter(c => c.fuel === fuel);
  res.json({ success: true, data: filtered, total: filtered.length });
});

app.get('/api/insurance-options', (req, res) => {
  res.json({ success: true, data: insuranceOptions });
});

app.get('*', (req, res) => {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(distIndex, (err) => {
    if (err) {
      res.status(404).send('dist/ not found. Run "npm run build" first.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚗 PremiRide Server`);
  console.log(`   http://localhost:${PORT}\n`);
});