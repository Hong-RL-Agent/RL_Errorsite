import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5033;

app.use(cors());
app.use(express.json());

// Cash Balance in KRW (50 Million)
let cashBalance = 50000000;

// Stocks database (15 items)
let stocks = [
  { id: "STK-01", code: "005930", name: "삼성전자", price: 72000, changeRate: 1.2, prevPrice: 71100, high: 73000, low: 71000 },
  { id: "STK-02", code: "000660", name: "SK하이닉스", price: 115000, changeRate: -0.8, prevPrice: 116000, high: 118000, low: 114000 },
  { id: "STK-03", code: "035420", name: "NAVER", price: 195000, changeRate: 2.5, prevPrice: 190000, high: 198000, low: 189000 },
  { id: "STK-04", code: "035720", name: "카카오", price: 49000, changeRate: -1.5, prevPrice: 49750, high: 50500, low: 48800 },
  { id: "STK-05", code: "005380", name: "현대차", price: 205000, changeRate: 0.5, prevPrice: 204000, high: 208500, low: 203000 },
  { id: "STK-06", code: "AAPL", name: "Apple Inc.", price: 240000, changeRate: 1.8, prevPrice: 235700, high: 242000, low: 235000 },
  { id: "STK-07", code: "TSLA", name: "Tesla Inc.", price: 310000, changeRate: 5.4, prevPrice: 294000, high: 320000, low: 292000 },
  { id: "STK-08", code: "NVDA", name: "NVIDIA Corp.", price: 650000, changeRate: 8.2, prevPrice: 600700, high: 660000, low: 598000 },
  { id: "STK-09", code: "MSFT", name: "Microsoft Corp.", price: 420000, changeRate: 0.3, prevPrice: 418700, high: 425000, low: 417000 },
  { id: "STK-10", code: "AMZN", name: "Amazon.com Inc.", price: 180000, changeRate: -2.1, prevPrice: 183800, high: 185000, low: 178000 },
  { id: "STK-11", code: "051910", name: "LG화학", price: 480000, changeRate: -3.2, prevPrice: 496000, high: 501000, low: 478000 },
  { id: "STK-12", code: "006400", name: "삼성SDI", price: 520000, changeRate: 1.1, prevPrice: 514000, high: 528000, low: 512000 },
  { id: "STK-13", code: "003670", name: "포스코퓨처엠", price: 330000, changeRate: -4.5, prevPrice: 345500, high: 350000, low: 326000 },
  { id: "STK-14", code: "NFLX", name: "Netflix Inc.", price: 580000, changeRate: 2.9, prevPrice: 563600, high: 585000, low: 561000 },
  { id: "STK-15", code: "036570", name: "엔씨소프트", price: 210000, changeRate: -0.2, prevPrice: 210500, high: 214000, low: 208500 }
];

// Holdings database (Owned virtual stocks)
let holdings = [
  { stockId: "STK-01", name: "삼성전자", qty: 100, avgPrice: 70000, totalCost: 7000000 },
  { stockId: "STK-02", name: "SK하이닉스", qty: 50, avgPrice: 110000, totalCost: 5500000 }
];

// Order History Database (Preseeded with exactly 20 items to satisfy requirement)
let orders = [
  { id: "ord-01", stockId: "STK-01", stockName: "삼성전자", type: "buy", qty: 50, price: 68500, status: "체결", date: "2026-07-10 09:15" },
  { id: "ord-02", stockId: "STK-01", stockName: "삼성전자", type: "buy", qty: 50, price: 71500, status: "체결", date: "2026-07-10 10:30" },
  { id: "ord-03", stockId: "STK-02", stockName: "SK하이닉스", type: "buy", qty: 30, price: 108000, status: "체결", date: "2026-07-10 11:24" },
  { id: "ord-04", stockId: "STK-03", stockName: "NAVER", type: "buy", qty: 10, price: 190000, status: "체결", date: "2026-07-10 13:45" },
  { id: "ord-05", stockId: "STK-03", stockName: "NAVER", type: "sell", qty: 10, price: 196000, status: "체결", date: "2026-07-10 14:02" },
  { id: "ord-06", stockId: "STK-04", stockName: "카카오", type: "buy", qty: 100, price: 51000, status: "체결", date: "2026-07-11 09:05" },
  { id: "ord-07", stockId: "STK-04", stockName: "카카오", type: "sell", qty: 100, price: 49500, status: "체결", date: "2026-07-11 10:20" },
  { id: "ord-08", stockId: "STK-02", stockName: "SK하이닉스", type: "buy", qty: 20, price: 113000, status: "체결", date: "2026-07-11 11:15" },
  { id: "ord-09", stockId: "STK-05", stockName: "현대차", type: "buy", qty: 15, price: 201000, status: "체결", date: "2026-07-11 13:30" },
  { id: "ord-10", stockId: "STK-05", stockName: "현대차", type: "sell", qty: 15, price: 206000, status: "체결", date: "2026-07-11 14:50" },
  { id: "ord-11", stockId: "STK-07", stockName: "Tesla Inc.", type: "buy", qty: 5, price: 289000, status: "체결", date: "2026-07-12 09:12" },
  { id: "ord-12", stockId: "STK-07", stockName: "Tesla Inc.", type: "sell", qty: 5, price: 305000, status: "체결", date: "2026-07-12 10:44" },
  { id: "ord-13", stockId: "STK-08", stockName: "NVIDIA Corp.", type: "buy", qty: 8, price: 610000, status: "체결", date: "2026-07-12 11:05" },
  { id: "ord-14", stockId: "STK-08", stockName: "NVIDIA Corp.", type: "sell", qty: 8, price: 642000, status: "체결", date: "2026-07-12 11:55" },
  { id: "ord-15", stockId: "STK-09", stockName: "Microsoft Corp.", type: "buy", qty: 12, price: 412000, status: "체결", date: "2026-07-12 13:10" },
  { id: "ord-16", stockId: "STK-09", stockName: "Microsoft Corp.", type: "sell", qty: 12, price: 418000, status: "체결", date: "2026-07-12 14:35" },
  { id: "ord-17", stockId: "STK-11", stockName: "LG화학", type: "buy", qty: 10, price: 490000, status: "체결", date: "2026-07-13 09:18" },
  { id: "ord-18", stockId: "STK-11", stockName: "LG화학", type: "sell", qty: 10, price: 481000, status: "체결", date: "2026-07-13 10:25" },
  { id: "ord-19", stockId: "STK-12", stockName: "삼성SDI", type: "buy", qty: 6, price: 511000, status: "체결", date: "2026-07-13 11:02" },
  { id: "ord-20", stockId: "STK-12", stockName: "삼성SDI", type: "sell", qty: 6, price: 519000, status: "체결", date: "2026-07-13 13:15" }
];

// Investment News contents
const news = [
  { id: 1, headline: "삼성전자, 2분기 반도체 턴어라운드 본격화... 목표가 상향 봇물", source: "경제일보" },
  { id: 2, headline: "엔비디아 시가총액 애플 제치고 1위 탈환... AI 반도체 열풍 여전", source: "글로벌파이낸셜" },
  { id: 3, headline: "금리 인하 기조 속 기술주 중심 강세... KOSPI 2700 돌파 시도", source: "마켓투데이" }
];

// API: Get Stocks
app.get('/api/stocks', (req, res) => {
  res.json(stocks);
});

// API: Sync/Refresh prices
app.get('/api/stocks/sync', (req, res) => {
  // Randomly fluctuate prices slightly
  stocks = stocks.map(s => {
    const change = (Math.random() - 0.48) * 0.04; // -1.9% ~ +2.1%
    const nextPrice = Math.round(s.price * (1 + change));
    const nextChange = ((nextPrice - s.prevPrice) / s.prevPrice) * 100;
    return {
      ...s,
      price: nextPrice,
      changeRate: Number(nextChange.toFixed(2)),
      high: Math.max(s.high, nextPrice),
      low: Math.min(s.low, nextPrice)
    };
  });
  res.json(stocks);
});

// API: Get Portfolio holdings and Cash Balance
app.get('/api/portfolio', (req, res) => {
  res.json({ cashBalance, holdings });
});

// API: Get Order History
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Post Order (Buy / Sell)
app.post('/api/orders', (req, res) => {
  const { type, stockId, qty, price } = req.body;

  if (!type || !stockId || !qty || !price) {
    return res.status(400).json({ error: "주문 파라미터가 누락되었습니다." });
  }

  const orderQty = Number(qty);
  const orderPrice = Number(price);
  const orderTotalCost = orderQty * orderPrice;

  const stock = stocks.find(s => s.id === stockId);
  if (!stock) {
    return res.status(404).json({ error: "존재하지 않는 주식 종목입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 매수 거래 수량이 정확히 100주인 경우, 정상적인 검증 실패(400)나 거래거부 대신 
  // 백엔드 모의 체결 분배 쓰레드 덤프 락 예외를 임의로 재현하여 HTTP 500 에러를 반환하게 만듭니다.
  if (type === 'buy' && orderQty === 100) {
    return res.status(500).json({
      error: "Internal Server Error: StockExecutionRoundLotOverflowException - Execution engine failed to clear round lot limit of exactly 100 shares."
    });
  }

  // Check Cash Balance (Error 5 Target)
  if (type === 'buy' && orderTotalCost > cashBalance) {
    // INTENTIONAL_ERROR
    // CATEGORY: Backend
    // DESCRIPTION: 매매 가능 현금(cashBalance)이 부족함에도 불구하고, 
    // 브라우저에는 400 에러를 반환하면서 동시에 내부 orders 로그 데이터베이스에는 
    // '대기' 상태의 주문서 레코드를 강제로 삽입해두는 불일치 처리를 일으킵니다.
    orders.unshift({
      id: `ord-${Date.now()}`,
      stockId,
      stockName: stock.name,
      type,
      qty: orderQty,
      price: orderPrice,
      status: "대기",
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    return res.status(400).json({ error: "예수금이 부족하여 해당 매수 주문을 처리할 수 없습니다." });
  }

  // Processing BUY
  if (type === 'buy') {
    cashBalance -= orderTotalCost;

    let holding = holdings.find(h => h.stockId === stockId);
    if (holding) {
      holding.qty += orderQty;
      holding.totalCost += orderTotalCost;
      holding.avgPrice = Math.round(holding.totalCost / holding.qty);
    } else {
      holdings.push({
        stockId,
        name: stock.name,
        qty: orderQty,
        avgPrice: orderPrice,
        totalCost: orderTotalCost
      });
    }
  }

  // Processing SELL (Error 3 Target)
  if (type === 'sell') {
    let holding = holdings.find(h => h.stockId === stockId);
    if (!holding || holding.qty < orderQty) {
      return res.status(400).json({ error: "보유 수량이 매도하려는 수량보다 부족합니다." });
    }

    cashBalance += orderTotalCost;
    holding.qty -= orderQty;

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 매도 주문 성공 시 보유 수량(qty)은 정상 차감하지만, 
    // 보유 주식 원가(totalCost)를 함께 깎아주지 않고 그대로 유지시킵니다. 
    // 이로 인해 매도 완료 후 남아있는 주식의 평균단가(avgPrice = totalCost / qty)가 
    // 부당하게 치솟아 기괴한 장부 왜곡이 나타납니다.
    // 원래 수행되어야 할 차감 계산 누락:
    // holding.totalCost -= (orderQty * holding.avgPrice);
    
    // 만약 보유 주식을 전부 팔았으면 종목 소거
    if (holding.qty <= 0) {
      holdings = holdings.filter(h => h.stockId !== stockId);
    } else {
      // 평균가 고정 또는 누락된 totalCost 때문에 나누면 커짐
      holding.avgPrice = Math.round(holding.totalCost / holding.qty);
    }
  }

  // Push successful order to logs
  const newOrder = {
    id: `ord-${Date.now()}`,
    stockId,
    stockName: stock.name,
    type,
    qty: orderQty,
    price: orderPrice,
    status: "체결",
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  orders.unshift(newOrder);

  res.status(201).json({ success: true, cashBalance, holdings, order: newOrder });
});

// Reset portfolio tool (for sandbox refresh helper)
app.post('/api/portfolio/reset', (req, res) => {
  cashBalance = 50000000;
  holdings = [
    { stockId: "STK-01", name: "삼성전자", qty: 100, avgPrice: 70000, totalCost: 7000000 },
    { stockId: "STK-02", name: "SK하이닉스", qty: 50, avgPrice: 110000, totalCost: 5500000 }
  ];
  res.json({ success: true, cashBalance, holdings });
});

// Get Investment news
app.get('/api/news', (req, res) => {
  res.json(news);
});

app.listen(PORT, () => {
  console.log(`[PaperTrade Backend] Express server running on http://localhost:${PORT}`);
});
