import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5018;

app.use(cors());
app.use(express.json());

// Parcels Database
let parcels = [
  {
    waybill: "1002030999", // ends with 999 to trigger Error 2
    sender: "김철수",
    senderAddr: "서울시 서대문구 신촌로 102",
    receiver: "이영희",
    receiverAddr: "부산시 해운대구 달맞이길 55",
    itemName: "의류 가디건 1벌",
    weight: 1.5,
    method: "standard",
    fee: 4500,
    status: "delivered"
  },
  {
    waybill: "1002030111",
    sender: "박민우",
    senderAddr: "인천시 남동구 예술로 24",
    receiver: "최다희",
    receiverAddr: "광주시 동구 제봉로 11",
    itemName: "소형 전자기기 충전기",
    weight: 0.8,
    method: "express",
    fee: 7000,
    status: "transit"
  }
];

// API: Get all parcels
app.get('/api/parcels', (req, res) => {
  res.json(parcels);
});

// API: Create new parcel booking
app.post('/api/parcels', (req, res) => {
  const { sender, senderAddr, receiver, receiverAddr, itemName, weight, method, fee } = req.body;

  if (!sender || !receiver || !itemName || !weight) {
    return res.status(400).json({ error: "송하인, 수하인 정보 및 물품 정보는 필수 입력값입니다." });
  }

  const newWaybill = `1002030${Math.floor(100 + Math.random() * 900)}`;

  const newParcel = {
    waybill: newWaybill,
    sender,
    senderAddr: senderAddr || "지정 안 됨",
    receiver,
    receiverAddr: receiverAddr || "지정 안 됨",
    itemName,
    weight: Number(weight),
    method,
    fee: Number(fee) || 3000,
    status: "ready"
  };

  parcels.push(newParcel);
  res.status(201).json(newParcel);
});

// API: Track parcel status (Error 2: Ends with 999 triggers malformed JSON)
app.get('/api/tracking/:waybill', (req, res) => {
  const { waybill } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 운송장 번호가 '999'로 끝날 경우, 올바른 JSON 파싱이 불가능하게 만드는 
  // 문법 오류가 기입된 문자열(배열이 닫히지 않은 깨진 JSON 포맷)을 강제로 헤더와 함께 응답하여 
  // 프론트엔드 파서(JSON.parse)에서 구문 분석 장애(SyntaxError)를 일으키도록 만듭니다.
  if (waybill.endsWith('999')) {
    res.setHeader('Content-Type', 'application/json');
    return res.send(`{"status": "success", "waybill": "${waybill}", "steps": [ {"node": "집화 완료", "date": "2026-07-10 10:00"} `); 
  }

  const p = parcels.find(x => x.waybill === waybill);
  if (!p) {
    return res.status(404).json({ error: "존재하지 않는 운송장 번호입니다." });
  }

  // Delivery Scans list
  const steps = [
    { node: "집화 완료", date: "2026-07-10 14:00", place: "서울 서교센터", icon: "/images/icon-ready.svg" },
    { node: "배송 중", date: "2026-07-11 10:00", place: "대전 허브터미널", icon: "/images/icon-ship.svg" }
  ];

  if (p.status === 'delivered') {
    // INTENTIONAL_ERROR
    // CATEGORY: Server
    // DESCRIPTION: 배송 완료 단계에 매칭된 아이콘 파일 경로를 서버에 존재하지 않는 
    // 정적 주소인 '/images/icon-complete-missing.png'로 기입하여 반환합니다. 
    // 프론트엔드상에서 이 이미지를 로드할 때 404가 발생하여 완료 단계 아이콘만 엑스박스로 처리됩니다.
    steps.push({ 
      node: "배송 완료", 
      date: "2026-07-12 15:30", 
      place: "수하인 위탁장소 (문앞)", 
      icon: "/images/icon-complete-missing.png" 
    });
  }

  res.json({
    waybill: p.waybill,
    status: p.status,
    sender: p.sender,
    receiver: p.receiver,
    itemName: p.itemName,
    fee: p.fee,
    steps: steps
  });
});

// Dynamic SVG Icons for normal stages
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;

  if (filename === 'icon-ready.svg') {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
        <path d="M12 7v5l3 3" />
      </svg>
    `);
  }

  if (filename === 'icon-ship.svg') {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    `);
  }

  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`[ParcelFlow Backend] Express server running on http://localhost:${PORT}`);
});
