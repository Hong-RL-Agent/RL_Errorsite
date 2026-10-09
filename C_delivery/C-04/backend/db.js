const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'supporthub.db');
const db = new sqlite3.Database(dbPath);

const initialTickets = [
  {
    id: 1042,
    customer_id: 12,
    customer_name: '김민지',
    customer_email: 'minji.kim@example.com',
    subject: '환불 요청 문의',
    content: '주문한 상품이 사이즈가 맞지 않아 환불을 신청하고 싶습니다. 반품 절차와 환불 소요 시간을 안내받고 싶습니다.',
    category: 'REFUND',
    status: 'RECEIVED',
    priority: 'NORMAL',
    created_at: '2026-10-08 09:30:00',
    updated_at: '2026-10-08 09:30:00'
  },
  {
    id: 1041,
    customer_id: 15,
    customer_name: '이준호',
    customer_email: 'junho.lee@example.com',
    subject: '로그인 문제 문의',
    content: '비밀번호를 재설정했는데도 로그인이 되지 않고 계정 잠금 오류 코드가 뜹니다. 확인 부탁드립니다.',
    category: 'ACCOUNT',
    status: 'RECEIVED',
    priority: 'HIGH',
    created_at: '2026-10-08 10:15:00',
    updated_at: '2026-10-08 10:15:00'
  },
  {
    id: 1040,
    customer_id: 18,
    customer_name: '박서연',
    customer_email: 'seoyeon.park@example.com',
    subject: '배송 일정 문의',
    content: '어제 주문한 상품의 송장 번호 조회가 되지 않습니다. 금주 내로 수령이 가능한지 확인 바랍니다.',
    category: 'DELIVERY',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    created_at: '2026-10-08 11:00:00',
    updated_at: '2026-10-08 11:20:00'
  },
  {
    id: 1039,
    customer_id: 22,
    customer_name: '정우성',
    customer_email: 'woosung.jung@example.com',
    subject: '결제 승인 문의',
    content: '결제 중 통신 오류로 인해 2회 중복 승인되었습니다. 중복 결제 취소 요청드립니다.',
    category: 'PAYMENT',
    status: 'ANSWERED',
    priority: 'HIGH',
    created_at: '2026-10-08 08:45:00',
    updated_at: '2026-10-08 09:10:00'
  },
  {
    id: 1038,
    customer_id: 25,
    customer_name: '최유나',
    customer_email: 'yuna.choi@example.com',
    subject: '포인트 적립 누락 문의',
    content: '지난주 리뷰 작성 이벤트 참여로 지급되어야 할 5,000 마일리지가 아직 적립되지 않았습니다.',
    category: 'OTHER',
    status: 'RECEIVED',
    priority: 'LOW',
    created_at: '2026-10-08 07:50:00',
    updated_at: '2026-10-08 07:50:00'
  },
  {
    id: 1037,
    customer_id: 30,
    customer_name: '강하늘',
    customer_email: 'haneul.kang@example.com',
    subject: '단순 변심 반품 배송비 문의',
    content: '무료 배송 혜택을 받은 주문의 전체 반품 시 차감되는 왕복 배송비 정책이 궁금합니다.',
    category: 'REFUND',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    created_at: '2026-10-08 06:30:00',
    updated_at: '2026-10-08 07:00:00'
  }
];

const initialReplies = [
  {
    id: 301,
    ticket_id: 1039,
    author: '상담원 김지원',
    author_type: 'AGENT',
    content: '안녕하세요 정우성 고객님, SupportHub 고객센터입니다. 중복 결제 내역 확인 완료되어 1건에 대해 즉시 카드 승인 취소 접수 처리해 드렸습니다. 영업일 기준 3~5일 이내 카드사 취소 반영됩니다.',
    created_at: '2026-10-08 09:10:00'
  },
  {
    id: 302,
    ticket_id: 1040,
    author: '상담원 이서진',
    author_type: 'AGENT',
    content: '안녕하세요 박서연 고객님, 담당 물류센터에 긴급 출고 요청 전달하였으며 오늘 오후 4시 송장 번호가 등록될 예정입니다.',
    created_at: '2026-10-08 11:20:00'
  }
];

const initialTemplates = [
  {
    id: 1,
    title: '환불 절차 안내',
    category: 'REFUND',
    content: '안녕하세요 고객님, SupportHub 고객센터입니다.\n\n요청해 주신 환불 건에 대해 안내드립니다.\n[마이페이지 > 주문내역 > 반품신청]을 통해 신청해 주시면 택배 기사님이 2~3 영업일 내로 방문 수거를 진행합니다. 상품 검수 완료 후 결제 수단으로 환불 처리됩니다.\n\n추가 문의사항이 있으시면 언제든지 문의해 주세요.'
  },
  {
    id: 2,
    title: '배송 지연 안내',
    category: 'DELIVERY',
    content: '안녕하세요 고객님, SupportHub 고객센터입니다.\n\n현재 프로모션으로 인한 물류센터 출고량 급증으로 배송이 1~2일 지연되고 있습니다. 고객님의 소중한 상품이 안전하고 빠르게 배송될 수 있도록 최선을 다하겠습니다.\n\n이용에 불편을 드려 대단히 죄송합니다.'
  },
  {
    id: 3,
    title: '계정 보안 및 로그인 안내',
    category: 'ACCOUNT',
    content: '안녕하세요 고객님, SupportHub 고객센터입니다.\n\n로그인 오류가 지속될 경우 브라우저 캐시 및 쿠키를 삭제하신 후 재시도하시거나, 로그인 화면 하단의 [비밀번호 재설정]을 통해 새로운 비밀번호를 설정해 주시기 바랍니다.'
  },
  {
    id: 4,
    title: '결제 취소 및 환불 일정 안내',
    category: 'PAYMENT',
    content: '안녕하세요 고객님, SupportHub 고객센터입니다.\n\n승인 취소 처리된 결제 건은 카드사 전산 반영 기준 영업일 3~5일 후 승인 취소 내역을 확인하실 수 있습니다. 체크카드의 경우 해당 계좌로 환불 입금됩니다.'
  }
];

function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        author TEXT NOT NULL,
        author_type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS drafts (
        ticket_id INTEGER PRIMARY KEY,
        content TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Check count and seed if empty
    db.get('SELECT COUNT(*) as count FROM tickets', (err, row) => {
      if (!err && row.count === 0) {
        resetDb();
      }
    });
  });
}

function resetDb(callback) {
  db.serialize(() => {
    db.run('DELETE FROM replies');
    db.run('DELETE FROM tickets');
    db.run('DELETE FROM templates');
    db.run('DELETE FROM drafts');

    const insertTicket = db.prepare(`
      INSERT INTO tickets (id, customer_id, customer_name, customer_email, subject, content, category, status, priority, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialTickets.forEach(t => {
      insertTicket.run(t.id, t.customer_id, t.customer_name, t.customer_email, t.subject, t.content, t.category, t.status, t.priority, t.created_at, t.updated_at);
    });
    insertTicket.finalize();

    const insertReply = db.prepare(`
      INSERT INTO replies (id, ticket_id, author, author_type, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    initialReplies.forEach(r => {
      insertReply.run(r.id, r.ticket_id, r.author, r.author_type, r.content, r.created_at);
    });
    insertReply.finalize();

    const insertTemplate = db.prepare(`
      INSERT INTO templates (id, title, category, content)
      VALUES (?, ?, ?, ?)
    `);

    initialTemplates.forEach(tpl => {
      insertTemplate.run(tpl.id, tpl.title, tpl.category, tpl.content);
    });
    insertTemplate.finalize();

    if (callback) callback();
  });
}

initDb();

module.exports = {
  db,
  resetDb
};
