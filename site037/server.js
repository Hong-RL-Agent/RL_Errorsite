import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 9256;

app.use(express.json());

const photos = [
  {
    id: 'photo-001',
    title: 'Satin Morning Vows',
    category: 'wedding',
    categoryLabel: '웨딩',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=84',
    location: 'Seoul Cathedral Hall',
    year: 2025,
    likes: 184,
    height: 'tall'
  },
  {
    id: 'photo-002',
    title: 'Editorial Veil Study',
    category: 'wedding',
    categoryLabel: '웨딩',
    imageUrl: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=84',
    location: 'Hannam Private House',
    year: 2024,
    likes: 142,
    height: 'medium'
  },
  {
    id: 'photo-003',
    title: 'Silver Profile Session',
    category: 'profile',
    categoryLabel: '프로필',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=84',
    location: 'Atelier Noir Studio A',
    year: 2026,
    likes: 96,
    height: 'short'
  },
  {
    id: 'photo-004',
    title: 'Cream Tone Portrait',
    category: 'profile',
    categoryLabel: '프로필',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=84',
    location: 'Atelier Noir Studio B',
    year: 2025,
    likes: 121,
    height: 'tall'
  },
  {
    id: 'photo-005',
    title: 'Monochrome Fragrance Campaign',
    category: 'commercial',
    categoryLabel: '커머셜',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=84',
    location: 'Mapo Daylight Loft',
    year: 2025,
    likes: 208,
    height: 'medium'
  },
  {
    id: 'photo-006',
    title: 'Minimal Object Table',
    category: 'commercial',
    categoryLabel: '커머셜',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=84',
    location: 'Studio C Product Bay',
    year: 2024,
    likes: 88,
    height: 'short'
  },
  {
    id: 'photo-007',
    title: 'Deep Gray Fashion Story',
    category: 'editorial',
    categoryLabel: '에디토리얼',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=84',
    location: 'Seongsu Archive Floor',
    year: 2025,
    likes: 176,
    height: 'tall'
  },
  {
    id: 'photo-008',
    title: 'Window Light Interview',
    category: 'editorial',
    categoryLabel: '에디토리얼',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=84',
    location: 'Bukchon Gallery Residence',
    year: 2024,
    likes: 114,
    height: 'medium'
  },
  {
    id: 'photo-009',
    title: 'Bridal Silver Afterglow',
    category: 'wedding',
    categoryLabel: '웨딩',
    imageUrl: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=84',
    location: 'Yongsan Glass House',
    year: 2026,
    likes: 231,
    height: 'short'
  },
  {
    id: 'photo-010',
    title: 'Founder Headshot Noir',
    category: 'profile',
    categoryLabel: '프로필',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=84',
    location: 'Atelier Noir Studio A',
    year: 2026,
    likes: 73,
    height: 'medium'
  }
];

const services = [
  {
    id: 'service-wedding-signature',
    name: 'Signature Wedding Editorial',
    category: 'wedding',
    price: '2,900,000 KRW',
    description: '본식과 야외 연출 컷을 한 권의 매거진처럼 구성하는 프리미엄 웨딩 촬영입니다.',
    duration: '6 hours',
    deliverables: '보정본 80장, 아트북 1권, 온라인 갤러리'
  },
  {
    id: 'service-wedding-small',
    name: 'Intimate Ceremony',
    category: 'wedding',
    price: '1,650,000 KRW',
    description: '스몰 웨딩과 가족 중심 예식을 위한 조용하고 밀도 있는 다큐멘터리 촬영입니다.',
    duration: '3 hours',
    deliverables: '보정본 45장, 모바일 갤러리'
  },
  {
    id: 'service-profile',
    name: 'Studio Profile Session',
    category: 'profile',
    price: '390,000 KRW',
    description: '개인 브랜딩, 배우 프로필, 임원 헤드샷에 맞춘 조명 중심 프로필 촬영입니다.',
    duration: '90 minutes',
    deliverables: '보정본 6장, 원본 셀렉션'
  },
  {
    id: 'service-commercial',
    name: 'Brand Campaign Day',
    category: 'commercial',
    price: '3,600,000 KRW',
    description: '룩북, 제품, 캠페인 비주얼을 한 번에 구축하는 브랜드 데이 패키지입니다.',
    duration: '8 hours',
    deliverables: '보정본 120장, 현장 디렉팅, 사용권 협의'
  },
  {
    id: 'service-editorial',
    name: 'Editorial Story',
    category: 'editorial',
    price: '1,200,000 KRW',
    description: '잡지, 인터뷰, 포트폴리오 피처에 어울리는 콘셉트 기반 에디토리얼 촬영입니다.',
    duration: '4 hours',
    deliverables: '보정본 30장, 무드보드 컨설팅'
  }
];

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: 'site037',
    service: 'Atelier Noir Studio',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/photos', (req, res) => {
  res.json({ photos });
});

app.get('/api/services', (req, res) => {
  res.json({ services });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`site037 running at http://localhost:${PORT}`);
});
