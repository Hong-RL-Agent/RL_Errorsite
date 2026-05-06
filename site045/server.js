import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9264;

const services = [
  {
    id: 'service1',
    name: '프리미엄 컷 & 스타일링',
    category: '헤어컷',
    duration: '90분',
    price: '₩120,000',
    recommended: '정교한 스타일링을 원하는 고객',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'service2',
    name: '럭셔리 염색 케어',
    category: '염색',
    duration: '120분',
    price: '₩180,000',
    recommended: '톤 보정 및 윤기 강화 필요 고객',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'service3',
    name: '볼륨 매직 스타일',
    category: '펌',
    duration: '150분',
    price: '₩230,000',
    recommended: '자연스러운 윤기와 볼륨을 원하는 고객',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'service4',
    name: '케어 트리트먼트 패키지',
    category: '케어',
    duration: '60분',
    price: '₩90,000',
    recommended: '손상 모발 복구를 원하는 고객',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'service5',
    name: '스페셜 헤어 앤 메이크업',
    category: '메이크업',
    duration: '140분',
    price: '₩260,000',
    recommended: '중요한 행사 준비 고객',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
  }
];

const stylists = [
  {
    id: 'stylist1',
    name: '린다 윤',
    specialty: '컬러 전문가',
    rating: 4.9,
    available: ['10:00', '12:30', '15:00', '17:30'],
    profile: '자연스러운 톤업과 환한 컬러 연출 전문입니다.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'stylist2',
    name: '소피아 김',
    specialty: '커트 & 스타일링',
    rating: 4.8,
    available: ['09:30', '11:30', '14:00', '16:30'],
    profile: '페이스 라인에 맞춘 컷과 고급스러운 스타일을 제공합니다.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'stylist3',
    name: '지아 박',
    specialty: '매직 & 펌',
    rating: 4.7,
    available: ['10:30', '13:00', '15:30', '18:00'],
    profile: '볼륨감 있는 매직과 컬리 펌을 정교하게 설계합니다.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'stylist4',
    name: '하나 이',
    specialty: '헤어 케어',
    rating: 4.9,
    available: ['09:00', '12:00', '14:30', '17:00'],
    profile: '모발 손상 복구와 스파 케어를 세심하게 진행합니다.',
    image: 'https://images.unsplash.com/photo-1541525466735-3a13e02c45d8?auto=format&fit=crop&w=400&q=80'
  }
];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'site045 beauty booking' });
});

app.get('/api/services', (req, res) => {
  res.json({ services });
});

app.get('/api/stylists', (req, res) => {
  res.json({ stylists });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`site045 beauty salon listening on http://localhost:${PORT}`);
});
