const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9292;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const holdings = [
  {
    id: 'h-1001',
    name: 'Blue Harbor S&P 500 ETF',
    ticker: 'BHS500',
    type: 'ETF',
    quantity: 42,
    value: 6842000,
    returnRate: 8.4,
    weight: 24.8,
    risk: '중간',
    note: '미국 대형주 지수 추종 mock 자산'
  },
  {
    id: 'h-1002',
    name: 'Seoul Semiconductor Holdings',
    ticker: 'SSH',
    type: 'Stock',
    quantity: 118,
    value: 3216000,
    returnRate: -2.1,
    weight: 11.7,
    risk: '높음',
    note: '국내 성장주 성격의 개별 주식 mock 자산'
  },
  {
    id: 'h-1003',
    name: 'Emerald Treasury Bond 2030',
    ticker: 'ETB30',
    type: 'Bond',
    quantity: 65,
    value: 4965000,
    returnRate: 3.2,
    weight: 18.0,
    risk: '낮음',
    note: '중기 채권형 안정 자산 mock 포지션'
  },
  {
    id: 'h-1004',
    name: 'Global Healthcare Innovation Fund',
    ticker: 'GHIF',
    type: 'Fund',
    quantity: 31,
    value: 2794000,
    returnRate: 5.7,
    weight: 10.1,
    risk: '중간',
    note: '헬스케어 섹터 분산형 mock 펀드'
  },
  {
    id: 'h-1005',
    name: 'Cash Management Account',
    ticker: 'CMA',
    type: 'Cash',
    quantity: 1,
    value: 2150000,
    returnRate: 1.1,
    weight: 7.8,
    risk: '낮음',
    note: '대기성 현금 mock 계좌'
  },
  {
    id: 'h-1006',
    name: 'Asia Dividend Leaders ETF',
    ticker: 'ADLE',
    type: 'ETF',
    quantity: 57,
    value: 4142000,
    returnRate: 6.6,
    weight: 15.0,
    risk: '중간',
    note: '아시아 배당주 basket mock ETF'
  },
  {
    id: 'h-1007',
    name: 'Northstar Cloud Infrastructure',
    ticker: 'NCI',
    type: 'Stock',
    quantity: 24,
    value: 3475000,
    returnRate: 12.9,
    weight: 12.6,
    risk: '높음',
    note: '클라우드 인프라 개별주 mock 자산'
  }
];

const transactions = [
  {
    id: 't-2401',
    date: '2026-05-02',
    assetName: 'Blue Harbor S&P 500 ETF',
    type: '매수',
    amount: 820000,
    status: '완료'
  },
  {
    id: 't-2402',
    date: '2026-05-03',
    assetName: 'Cash Management Account',
    type: '입금',
    amount: 500000,
    status: '완료'
  },
  {
    id: 't-2403',
    date: '2026-04-18',
    assetName: 'Seoul Semiconductor Holdings',
    type: '매도',
    amount: 430000,
    status: '완료'
  },
  {
    id: 't-2404',
    date: '2026-04-09',
    assetName: 'Emerald Treasury Bond 2030',
    type: '이자',
    amount: 72000,
    status: '완료'
  },
  {
    id: 't-2405',
    date: '2026-03-22',
    assetName: 'Global Healthcare Innovation Fund',
    type: '매수',
    amount: 650000,
    status: '처리중'
  },
  {
    id: 't-2406',
    date: '2026-03-07',
    assetName: 'Asia Dividend Leaders ETF',
    type: '배당',
    amount: 96000,
    status: '완료'
  },
  {
    id: 't-2407',
    date: '2026-05-05',
    assetName: 'Northstar Cloud Infrastructure',
    type: '매수',
    amount: 1170000,
    status: '완료'
  }
];

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: 'site073',
    service: 'personal-investment-dashboard',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/holdings', (req, res) => {
  res.json({ items: holdings });
});

app.get('/api/transactions', (req, res) => {
  res.json({ items: transactions });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`site073 investment dashboard running at http://localhost:${PORT}`);
});
