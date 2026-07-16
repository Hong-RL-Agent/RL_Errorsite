import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5036;

app.use(cors());
app.use(express.json());

// 8 Riders Database
let riders = [
  { id: "rider-01", name: "김기사 (Rider 1)", status: "배달중", activeOrdersCount: 1, completedOrdersCount: 12, phone: "010-1234-5678" },
  { id: "rider-02", name: "박배달 (Rider 2)", status: "배달중", activeOrdersCount: 1, completedOrdersCount: 9, phone: "010-2345-6789" },
  { id: "rider-03", name: "이속도 (Rider 3)", status: "대기중", activeOrdersCount: 0, completedOrdersCount: 15, phone: "010-3456-7890" },
  { id: "rider-04", name: "최번개 (Rider 4)", status: "배달중", activeOrdersCount: 1, completedOrdersCount: 8, phone: "010-4567-8901" },
  { id: "rider-05", name: "정질주 (Rider 5)", status: "휴식중", activeOrdersCount: 0, completedOrdersCount: 14, phone: "010-5678-9012" },
  { id: "rider-06", name: "강신속 (Rider 6)", status: "대기중", activeOrdersCount: 0, completedOrdersCount: 11, phone: "010-6789-0123" },
  { id: "rider-07", name: "윤안전 (Rider 7)", status: "대기중", activeOrdersCount: 0, completedOrdersCount: 7, phone: "010-7890-1234" },
  { id: "rider-08", name: "조로켓 (Rider 8)", status: "휴식중", activeOrdersCount: 0, completedOrdersCount: 16, phone: "010-8901-2345" }
];

// 20 Orders Database
let orders = [
  { id: "order-01", destination: "서울시 강남구 역삼동 10-1", food: "마라탕 2인분", price: 24000, status: "대기중", time: "15분 전", riderId: null },
  { id: "order-02", destination: "서울시 서초구 반포동 5", food: "황금올리브치킨", price: 22000, status: "대기중", time: "12분 전", riderId: null },
  { id: "order-03", destination: "서울시 송파구 잠실동 30", food: "스시 패밀리세트", price: 38000, status: "대기중", time: "8분 전", riderId: null },
  { id: "order-04", destination: "서울시 마포구 서교동 4", food: "엽기떡볶이 덜매운맛", price: 19000, status: "대기중", time: "5분 전", riderId: null },
  { id: "order-05", destination: "서울시 강서구 화곡동 12", food: "자장면+탕수육 세트", price: 21000, status: "대기중", time: "방금 전", riderId: null },
  { id: "order-06", destination: "서울시 성동구 성수동 2", food: "아이스 아메리카노 4잔", price: 16000, status: "배달중", time: "20분 전", riderId: "rider-01" },
  { id: "order-07", destination: "서울시 영등포구 여의도동 1", food: "보쌈 소짜", price: 32000, status: "배달중", time: "18분 전", riderId: "rider-02" },
  { id: "order-08", destination: "서울시 종로구 혜화동 9", food: "더블치즈피자 L", price: 27000, status: "픽업완료", time: "10분 전", riderId: "rider-04" },
  { id: "order-09", destination: "서울시 용산구 이태원동 88", food: "수제버거 콤보 2개", price: 25000, status: "대기중", time: "11분 전", riderId: null },
  { id: "order-10", destination: "서울시 중구 명동 2", food: "순대국밥 2그릇", price: 18000, status: "대기중", time: "14분 전", riderId: null },
  { id: "order-11", destination: "서울시 강북구 수유동 77", food: "족발 반반세트", price: 39000, status: "대기중", time: "9분 전", riderId: null },
  { id: "order-12", destination: "서울시 관악구 신림동 501", food: "삼겹살 도시락 2개", price: 26000, status: "대기중", time: "13분 전", riderId: null },
  { id: "order-13", destination: "서울시 동작구 사당동 45", food: "뼈다귀해장국", price: 10000, status: "대기중", time: "6분 전", riderId: null },
  { id: "order-14", destination: "서울시 은평구 불광동 33", food: "돈까스 정식", price: 12000, status: "대기중", time: "4분 전", riderId: null },
  { id: "order-15", destination: "서울시 양천구 목동 91", food: "쌀국수+스프링롤", price: 17500, status: "대기중", time: "16분 전", riderId: null },
  { id: "order-16", destination: "서울시 구로구 신도림동 8", food: "야채곱창 2인분", price: 23000, status: "배달완료", time: "30분 전", riderId: "rider-05" },
  { id: "order-17", destination: "서울시 은평구 갈현동 14", food: "바닐라라떼 & 크로플", price: 13000, status: "배달완료", time: "40분 전", riderId: "rider-06" },
  { id: "order-18", destination: "서울시 동대문구 장안동 90", food: "해물찜 중짜", price: 45000, status: "배달완료", time: "45분 전", riderId: "rider-07" },
  { id: "order-19", destination: "서울시 서대문구 창천동 15", food: "쌀떡볶이 & 모듬튀김", price: 11000, status: "배달완료", time: "50분 전", riderId: "rider-08" },
  { id: "order-20", destination: "서울시 노원구 상계동 202", food: "김치찌개 백반", price: 9500, status: "배달완료", time: "55분 전", riderId: "rider-01" }
];

// API: Get riders
app.get('/api/riders', (req, res) => {
  res.json(riders);
});

// API: Get orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Assign Rider (Error 2)
app.post('/api/orders/assign', (req, res) => {
  const { orderId, riderId } = req.body;

  if (!orderId || !riderId) {
    return res.status(400).json({ error: "주문 혹은 기사 매개변수가 누락되었습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: order-14 주문을 rider-03 기사에게 배정하려 시도할 시, 
  // 기사 운행 구역 충돌 및 스케줄러 세션 잠금 오류를 흉내내어 고의로 HTTP 500 에러를 반환합니다.
  if (orderId === 'order-14' && riderId === 'rider-03') {
    return res.status(500).json({
      error: "Internal Server Error: DispatchAssignmentCollisionException - Dispatch engine failed to lock order-14 for rider-03 due to active route re-optimization."
    });
  }

  const order = orders.find(o => o.id === orderId);
  const rider = riders.find(r => r.id === riderId);

  if (!order || !rider) {
    return res.status(404).json({ error: "주문 또는 기사를 찾을 수 없습니다." });
  }

  order.status = "배달중";
  order.riderId = riderId;
  
  rider.status = "배달중";
  rider.activeOrdersCount += 1;

  res.json({ success: true, order, rider, riders, orders });
});

// API: Update order delivery status
app.post('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });

  order.status = status;
  res.json({ success: true, order });
});

// API: Complete delivery (Error 3)
app.post('/api/orders/:id/complete', (req, res) => {
  const { id } = req.params;

  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });

  order.status = "배달완료";

  const rider = riders.find(r => r.id === order.riderId);
  if (rider) {
    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 배달이 완료되어 주문 상태는 '배달완료'로 정상 조치되지만, 
    // 기사 소속의 진행 중인 업무 건수(activeOrdersCount)를 감산 처리해주지 않고 방치함으로써, 
    // 완료 후에도 기사는 여전히 '배달중' 임무를 지고 있는 것으로 왜곡 처리되게 만듭니다.
    rider.completedOrdersCount += 1;
    
    // 원래 행해져야 하는 기사 자격 수량 차감 누락:
    // rider.activeOrdersCount -= 1;
    if (rider.activeOrdersCount <= 0) {
      rider.status = "대기중";
    }
  }

  res.json({ success: true, order, riders, orders });
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  riders = [
    { id: "rider-01", name: "김기사 (Rider 1)", status: "배달중", activeOrdersCount: 1, completedOrdersCount: 12, phone: "010-1234-5678" },
    { id: "rider-02", name: "박배달 (Rider 2)", status: "배달중", activeOrdersCount: 1, completedOrdersCount: 9, phone: "010-2345-6789" },
    { id: "rider-03", name: "이속도 (Rider 3)", status: "대기중", activeOrdersCount: 0, completedOrdersCount: 15, phone: "010-3456-7890" },
    { id: "rider-04", name: "최번개 (Rider 4)", status: "배달중", activeOrdersCount: 1, completedOrdersCount: 8, phone: "010-4567-8901" },
    { id: "rider-05", name: "정질주 (Rider 5)", status: "휴식중", activeOrdersCount: 0, completedOrdersCount: 14, phone: "010-5678-9012" },
    { id: "rider-06", name: "강신속 (Rider 6)", status: "대기중", activeOrdersCount: 0, completedOrdersCount: 11, phone: "010-6789-0123" },
    { id: "rider-07", name: "윤안전 (Rider 7)", status: "대기중", activeOrdersCount: 0, completedOrdersCount: 7, phone: "010-7890-1234" },
    { id: "rider-08", name: "조로켓 (Rider 8)", status: "휴식중", activeOrdersCount: 0, completedOrdersCount: 16, phone: "010-8901-2345" }
  ];

  orders = [
    { id: "order-01", destination: "서울시 강남구 역삼동 10-1", food: "마라탕 2인분", price: 24000, status: "대기중", time: "15분 전", riderId: null },
    { id: "order-02", destination: "서울시 서초구 반포동 5", food: "황금올리브치킨", price: 22000, status: "대기중", time: "12분 전", riderId: null },
    { id: "order-03", destination: "서울시 송파구 잠실동 30", food: "스시 패밀리세트", price: 38000, status: "대기중", time: "8분 전", riderId: null },
    { id: "order-04", destination: "서울시 마포구 서교동 4", food: "엽기떡볶이 덜매운맛", price: 19000, status: "대기중", time: "5분 전", riderId: null },
    { id: "order-05", destination: "서울시 강서구 화곡동 12", food: "자장면+탕수육 세트", price: 21000, status: "대기중", time: "방금 전", riderId: null },
    { id: "order-06", destination: "서울시 성동구 성수동 2", food: "아이스 아메리카노 4잔", price: 16000, status: "배달중", time: "20분 전", riderId: "rider-01" },
    { id: "order-07", destination: "서울시 영등포구 여의도동 1", food: "보쌈 소짜", price: 32000, status: "배달중", time: "18분 전", riderId: "rider-02" },
    { id: "order-08", destination: "서울시 종로구 혜화동 9", food: "더블치즈피자 L", price: 27000, status: "픽업완료", time: "10분 전", riderId: "rider-04" },
    { id: "order-09", destination: "서울시 용산구 이태원동 88", food: "수제버거 콤보 2개", price: 25000, status: "대기중", time: "11분 전", riderId: null },
    { id: "order-10", destination: "서울시 중구 명동 2", food: "순대국밥 2그릇", price: 18000, status: "대기중", time: "14분 전", riderId: null },
    { id: "order-11", destination: "서울시 강북구 수유동 77", food: "족발 반반세트", price: 39000, status: "대기중", time: "9분 전", riderId: null },
    { id: "order-12", destination: "서울시 관악구 신림동 501", food: "삼겹살 도시락 2개", price: 26000, status: "대기중", time: "13분 전", riderId: null },
    { id: "order-13", destination: "서울시 동작구 사당동 45", food: "뼈다귀해장국", price: 10000, status: "대기중", time: "6분 전", riderId: null },
    { id: "order-14", destination: "서울시 은평구 불광동 33", food: "돈까스 정식", price: 12000, status: "대기중", time: "4분 전", riderId: null },
    { id: "order-15", destination: "서울시 양천구 목동 91", food: "쌀국수+스프링롤", price: 17500, status: "대기중", time: "16분 전", riderId: null },
    { id: "order-16", destination: "서울시 구로구 신도림동 8", food: "야채곱창 2인분", price: 23000, status: "배달완료", time: "30분 전", riderId: "rider-05" },
    { id: "order-17", destination: "서울시 은평구 갈현동 14", food: "바닐라라떼 & 크로플", price: 13000, status: "배달완료", time: "40분 전", riderId: "rider-06" },
    { id: "order-18", destination: "서울시 동대문구 장안동 90", food: "해물찜 중짜", price: 45000, status: "배달완료", time: "45분 전", riderId: "rider-07" },
    { id: "order-19", destination: "서울시 서대문구 창천동 15", food: "쌀떡볶이 & 모듬튀김", price: 11000, status: "배달완료", time: "50분 전", riderId: "rider-08" },
    { id: "order-20", destination: "서울시 노원구 상계동 202", food: "김치찌개 백반", price: 9500, status: "배달완료", time: "55분 전", riderId: "rider-01" }
  ];

  res.json({ success: true, riders, orders });
});

app.listen(PORT, () => {
  console.log(`[RiderFlow Backend] Express server running on http://localhost:${PORT}`);
});
