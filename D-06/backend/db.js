const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'orderpilot.db');
const db = new sqlite3.Database(DB_PATH);

// 25명 고객 초기 데이터
const INITIAL_CUSTOMERS = [
  { id: 1, name: '김민준', phone: '010-2345-1001', email: 'minjun.kim@shop.example.com', address: '서울특별시 강남구 테헤란로 123 401호', total_orders: 5, grade: 'VIP' },
  { id: 2, name: '이서윤', phone: '010-2345-1002', email: 'seoyun.lee@shop.example.com', address: '경기도 성남시 분당구 판교역로 45 102동 502호', total_orders: 4, grade: 'GOLD' },
  { id: 3, name: '박지훈', phone: '010-2345-1003', email: 'jihun.park@shop.example.com', address: '인천광역시 연수구 송도과학로 88 12층', total_orders: 6, grade: 'VIP' },
  { id: 4, name: '최유진', phone: '010-2345-1004', email: 'yujin.choi@shop.example.com', address: '대전광역시 유성구 대덕대로 512 301호', total_orders: 3, grade: 'SILVER' },
  { id: 5, name: '김서준', phone: '010-2345-1005', email: 'seojun.kim@shop.example.com', address: '부산광역시 해운대구 마린시티2로 33 2501호', total_orders: 5, grade: 'GOLD' },
  { id: 6, name: '정다은', phone: '010-2345-1006', email: 'daeun.jung@shop.example.com', address: '대구광역시 수성구 동대구로 111 802호', total_orders: 4, grade: 'GOLD' },
  { id: 7, name: '강현우', phone: '010-2345-1007', email: 'hyunwoo.kang@shop.example.com', address: '광주광역시 서구 상무중앙로 90 605호', total_orders: 2, grade: 'SILVER' },
  { id: 8, name: '조은채', phone: '010-2345-1008', email: 'eunchae.cho@shop.example.com', address: '울산광역시 남구 삼산로 222 1502호', total_orders: 3, grade: 'SILVER' },
  { id: 9, name: '윤도현', phone: '010-2345-1009', email: 'dohyun.yoon@shop.example.com', address: '세종특별자치시 한누리대로 411 901호', total_orders: 4, grade: 'GOLD' },
  { id: 10, name: '장하은', phone: '010-2345-1010', email: 'haeun.jang@shop.example.com', address: '경기도 수원시 영통구 광교중앙로 170 304호', total_orders: 5, grade: 'VIP' },
  { id: 11, name: '임태양', phone: '010-2345-1011', email: 'taeyang.lim@shop.example.com', address: '서울특별시 마포구 월드컵북로 396 701호', total_orders: 2, grade: 'SILVER' },
  { id: 12, name: '한소희', phone: '010-2345-1012', email: 'sohee.han@shop.example.com', address: '서울특별시 송파구 올림픽로 300 2201호', total_orders: 6, grade: 'VIP' },
  { id: 13, name: '오승우', phone: '010-2345-1013', email: 'seungwoo.oh@shop.example.com', address: '경기도 고양시 일산동구 중앙로 1275 405호', total_orders: 3, grade: 'SILVER' },
  { id: 14, name: '서예진', phone: '010-2345-1014', email: 'yejin.seo@shop.example.com', address: '부산광역시 수영구 광안해변로 255 1102호', total_orders: 4, grade: 'GOLD' },
  { id: 15, name: '신동엽', phone: '010-2345-1015', email: 'dongyeop.shin@shop.example.com', address: '충청북도 청주시 흥덕구 직지대로 600 503호', total_orders: 2, grade: 'SILVER' },
  { id: 16, name: '권보라', phone: '010-2345-1016', email: 'bora.kwon@shop.example.com', address: '전라북도 전주시 완산구 홍산로 245 804호', total_orders: 3, grade: 'SILVER' },
  { id: 17, name: '황준서', phone: '010-2345-1017', email: 'junseo.hwang@shop.example.com', address: '경상남도 창원시 성산구 중앙대로 105 1401호', total_orders: 4, grade: 'GOLD' },
  { id: 18, name: '안재민', phone: '010-2345-1018', email: 'jaemin.ahn@shop.example.com', address: '제주특별자치도 제주시 첨단로 213 202호', total_orders: 5, grade: 'VIP' },
  { id: 19, name: '송하늘', phone: '010-2345-1019', email: 'haneul.song@shop.example.com', address: '강원특별자치도 춘천시 중앙로 67 301호', total_orders: 2, grade: 'SILVER' },
  { id: 20, name: '류호준', phone: '010-2345-1020', email: 'hojun.ryu@shop.example.com', address: '서울특별시 용산구 한강대로 95 1801호', total_orders: 3, grade: 'SILVER' },
  { id: 21, name: '백선영', phone: '010-2345-1021', email: 'sunyoung.baek@shop.example.com', address: '경기도 용인시 수지구 포은대로 536 702호', total_orders: 4, grade: 'GOLD' },
  { id: 22, name: '고은지', phone: '010-2345-1022', email: 'eunji.ko@shop.example.com', address: '대구광역시 중구 달구벌대로 2095 1205호', total_orders: 2, grade: 'SILVER' },
  { id: 23, name: '문태경', phone: '010-2345-1023', email: 'taekyung.moon@shop.example.com', address: '인천광역시 남동구 정각로 29 403호', total_orders: 3, grade: 'SILVER' },
  { id: 24, name: '남궁훈', phone: '010-2345-1024', email: 'hoon.namgung@shop.example.com', address: '서울특별시 서초구 서초대로 397 1902호', total_orders: 5, grade: 'VIP' },
  { id: 25, name: '노진우', phone: '010-2345-1025', email: 'jinwoo.noh@shop.example.com', address: '경기도 안양시 동안구 시민대로 180 801호', total_orders: 2, grade: 'SILVER' }
];

// 상품 카탈로그 템플릿
const PRODUCT_CATALOG = [
  { name: '프리미엄 린넨 셔츠', price: 49000 },
  { name: '무선 노이즈캔슬링 헤드폰', price: 89000 },
  { name: '스마트 워치 스트랩', price: 29000 },
  { name: '천연 소가죽 카드지갑', price: 38000 },
  { name: '미니멀 데스크 매트', price: 24000 },
  { name: '인체공학 무선 버티컬 마우스', price: 42000 },
  { name: '알루미늄 랩탑 스탠드', price: 35000 },
  { name: '오가닉 코튼 오버핏 후드티', price: 59000 },
  { name: '세라믹 보온 텀블러 500ml', price: 28000 },
  { name: 'UV 살균 무선 충전기 거치대', price: 45000 }
];

// 초기 75건 주문 생성 함수
function generateInitialOrders() {
  const orders = [];
  const items = [];
  const logs = [];

  // 기본 날짜들: 2026-10-01 ~ 2026-10-12
  for (let i = 1; i <= 75; i++) {
    const day = (1 + Math.floor((i - 1) / 7)).toString().padStart(2, '0');
    const orderNo = `ORD-202610${day}-${i.toString().padStart(4, '0')}`;
    const cust = INITIAL_CUSTOMERS[(i - 1) % INITIAL_CUSTOMERS.length];
    const orderDate = `2026-10-${day} 1${(i % 10).toString()}:${((i * 7) % 60).toString().padStart(2, '0')}:00`;

    let payStatus = 'PAID';
    let delStatus = 'DELIVERED';
    let courier = 'CJ대한통운';
    let tracking = `689${(100000000 + i * 12345).toString().slice(0, 9)}`;
    let cancelReason = '';
    let refundReason = '';

    // 상태 분포 시드
    if (i === 5) {
      // BUG-D06-05 타깃 환불 대기 1
      payStatus = 'REFUND_REQUESTED';
      delStatus = 'DELIVERED';
      refundReason = '사이즈 불일치로 인한 전액 환불 요청';
    } else if (i === 10) {
      // BUG-D06-05 타깃 환불 대기 2 (선택 대상)
      payStatus = 'REFUND_REQUESTED';
      delStatus = 'DELIVERED';
      refundReason = '제품 단순 변심 환불 요청';
    } else if (i === 12) {
      // BUG-D06-01 타깃: 결제완료, 배송대기
      payStatus = 'PAID';
      delStatus = 'PENDING';
      courier = '';
      tracking = '';
    } else if (i === 8) {
      // BUG-D06-03 타깃: 배송중
      payStatus = 'PAID';
      delStatus = 'SHIPPING';
      courier = 'CJ대한통운';
      tracking = '689123456780';
    } else if (i === 7) {
      // BUG-D06-03 왜곡 대상: 배송중
      payStatus = 'PAID';
      delStatus = 'SHIPPING';
      courier = '우체국택배';
      tracking = '112987654321';
    } else if (i === 19) {
      // BUG-D06-04 타깃: 고객 정다은, 결제완료, 취소 대상
      payStatus = 'PAID';
      delStatus = 'PENDING';
      courier = '';
      tracking = '';
    } else if (i === 25) {
      // BUG-D06-02 타깃: 고객 김민준, 수량 변경 대상
      payStatus = 'PAID';
      delStatus = 'PREPARING';
      courier = '';
      tracking = '';
    } else if (i % 9 === 0) {
      payStatus = 'REFUND_REQUESTED';
      delStatus = 'DELIVERED';
      refundReason = '초기 불량으로 인한 환불 신청';
    } else if (i % 8 === 0) {
      payStatus = 'CANCELLED';
      delStatus = 'PENDING';
      cancelReason = '고객 단순 변심 취소';
      courier = '';
      tracking = '';
    } else if (i % 5 === 0) {
      payStatus = 'PAID';
      delStatus = 'PENDING';
      courier = '';
      tracking = '';
    } else if (i % 4 === 0) {
      payStatus = 'PAID';
      delStatus = 'PREPARING';
      courier = '';
      tracking = '';
    } else if (i % 3 === 0) {
      payStatus = 'PAID';
      delStatus = 'SHIPPING';
      courier = '로젠택배';
      tracking = `982${(200000000 + i * 54321).toString().slice(0, 9)}`;
    } else if (i % 7 === 0) {
      payStatus = 'WAITING';
      delStatus = 'PENDING';
      courier = '';
      tracking = '';
    }

    const payMethods = ['CREDIT_CARD', 'NAVER_PAY', 'KAKAO_PAY', 'BANK_TRANSFER'];
    const paymentMethod = payMethods[i % payMethods.length];

    // 품목 지정
    const prod = PRODUCT_CATALOG[(i - 1) % PRODUCT_CATALOG.length];
    const qty = (i === 25) ? 1 : (1 + (i % 3));
    const subtotal = prod.price * qty;
    const totalAmount = subtotal;

    orders.push({
      id: i,
      order_no: orderNo,
      customer_id: cust.id,
      customer_name: cust.name,
      customer_phone: cust.phone,
      customer_email: cust.email,
      address: cust.address,
      order_date: orderDate,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: payStatus,
      delivery_status: delStatus,
      courier: courier,
      tracking_number: tracking,
      cancel_reason: cancelReason,
      refund_reason: refundReason
    });

    items.push({
      id: i,
      order_id: i,
      product_name: prod.name,
      quantity: qty,
      unit_price: prod.price,
      subtotal: subtotal
    });

    logs.push({
      id: i,
      order_id: i,
      action: 'ORDER_CREATED',
      from_status: 'NONE',
      to_status: payStatus,
      note: `주문 정상 접수 (결제수단: ${paymentMethod})`,
      created_at: orderDate
    });
  }

  return { orders, items, logs };
}

const SEED_DATA = generateInitialOrders();

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. customers 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          address TEXT NOT NULL,
          total_orders INTEGER DEFAULT 0,
          grade TEXT NOT NULL
        )
      `);

      // 2. orders 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_no TEXT UNIQUE NOT NULL,
          customer_id INTEGER NOT NULL,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          address TEXT NOT NULL,
          order_date TEXT NOT NULL,
          total_amount INTEGER NOT NULL,
          payment_method TEXT NOT NULL,
          payment_status TEXT NOT NULL,
          delivery_status TEXT NOT NULL,
          courier TEXT,
          tracking_number TEXT,
          cancel_reason TEXT,
          refund_reason TEXT
        )
      `);

      // 3. order_items 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price INTEGER NOT NULL,
          subtotal INTEGER NOT NULL
        )
      `);

      // 4. order_logs 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS order_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          from_status TEXT,
          to_status TEXT,
          note TEXT,
          created_at TEXT NOT NULL
        )
      `);

      // 시드 데이터 주입 검사
      db.get('SELECT COUNT(*) AS count FROM orders', (err, row) => {
        if (err) return reject(err);
        if (row && row.count === 0) {
          resetAllData().then(resolve).catch(reject);
        } else {
          resolve();
        }
      });
    });
  });
}

function resetAllData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM customers');
      db.run('DELETE FROM orders');
      db.run('DELETE FROM order_items');
      db.run('DELETE FROM order_logs');

      // 1. 고객 주입
      const stmtCust = db.prepare('INSERT INTO customers (id, name, phone, email, address, total_orders, grade) VALUES (?, ?, ?, ?, ?, ?, ?)');
      INITIAL_CUSTOMERS.forEach(c => {
        stmtCust.run(c.id, c.name, c.phone, c.email, c.address, c.total_orders, c.grade);
      });
      stmtCust.finalize();

      // 2. 주문 주입
      const stmtOrder = db.prepare(`
        INSERT INTO orders (id, order_no, customer_id, customer_name, customer_phone, customer_email, address, order_date, total_amount, payment_method, payment_status, delivery_status, courier, tracking_number, cancel_reason, refund_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      SEED_DATA.orders.forEach(o => {
        stmtOrder.run(o.id, o.order_no, o.customer_id, o.customer_name, o.customer_phone, o.customer_email, o.address, o.order_date, o.total_amount, o.payment_method, o.payment_status, o.delivery_status, o.courier, o.tracking_number, o.cancel_reason, o.refund_reason);
      });
      stmtOrder.finalize();

      // 3. 품목 주입
      const stmtItem = db.prepare('INSERT INTO order_items (id, order_id, product_name, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
      SEED_DATA.items.forEach(it => {
        stmtItem.run(it.id, it.order_id, it.product_name, it.quantity, it.unit_price, it.subtotal);
      });
      stmtItem.finalize();

      // 4. 로그 주입
      const stmtLog = db.prepare('INSERT INTO order_logs (id, order_id, action, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
      SEED_DATA.logs.forEach(l => {
        stmtLog.run(l.id, l.order_id, l.action, l.from_status, l.to_status, l.note, l.created_at);
      });
      stmtLog.finalize((err) => {
        if (err) reject(err);
        else resolve({ orders: SEED_DATA.orders.length, customers: INITIAL_CUSTOMERS.length, items: SEED_DATA.items.length, logs: SEED_DATA.logs.length });
      });
    });
  });
}

module.exports = {
  db,
  initDatabase,
  resetAllData,
  INITIAL_CUSTOMERS,
  SEED_DATA
};
