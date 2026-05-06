import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 9255;

app.use(express.json());

const features = [
  {
    id: 'pipeline',
    name: 'Revenue Pipeline',
    description: '영업 리드, 계약 단계, 예측 매출을 한 화면에서 연결해 팀별 병목을 빠르게 찾습니다.',
    icon: 'trend',
    category: 'sales'
  },
  {
    id: 'automation',
    name: 'Workflow Automation',
    description: '승인, 알림, 고객 온보딩 태스크를 조건 기반으로 자동 실행합니다.',
    icon: 'bolt',
    category: 'ops'
  },
  {
    id: 'analytics',
    name: 'Board-ready Analytics',
    description: 'CAC, NRR, 세일즈 사이클 같은 SaaS 핵심 지표를 실시간 대시보드로 제공합니다.',
    icon: 'chart',
    category: 'analytics'
  },
  {
    id: 'security',
    name: 'Enterprise Controls',
    description: 'SSO, 감사 로그, 역할 기반 권한으로 보안 검토를 빠르게 통과합니다.',
    icon: 'shield',
    category: 'security'
  }
];

const testimonials = [
  {
    id: 'luma',
    company: 'LumaOps',
    quote: 'Northstar Cloud 도입 후 분기 파이프라인 리뷰 준비 시간이 70% 줄었습니다.',
    person: '정서윤, Revenue Operations Lead',
    logo: 'LumaOps'
  },
  {
    id: 'hexa',
    company: 'HexaGrid',
    quote: '영업과 고객성공팀이 같은 데이터를 보면서 갱신 위험을 훨씬 빨리 발견합니다.',
    person: 'Marcus Lee, VP Customer Success',
    logo: 'HexaGrid'
  },
  {
    id: 'mint',
    company: 'Mintwave',
    quote: '복잡한 BI 구축 없이도 투자자 보고용 SaaS 지표를 바로 뽑을 수 있었습니다.',
    person: '김하린, CFO',
    logo: 'Mintwave'
  },
  {
    id: 'orbit',
    company: 'Orbitdesk',
    quote: '제품 사용량과 계약 데이터를 연결한 뒤 업셀 타이밍이 훨씬 명확해졌습니다.',
    person: 'Avery Chen, Growth Director',
    logo: 'Orbitdesk'
  }
];

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: 'site036', service: 'Northstar Cloud', timestamp: new Date().toISOString() });
});

app.get('/api/features', (req, res) => {
  res.json({ features });
});

app.get('/api/testimonials', (req, res) => {
  res.json({ testimonials });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`site036 running at http://localhost:${PORT}`);
});
