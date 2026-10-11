const { run, clearData } = require("./init");

const categories = ["디지털기기", "생활가전", "패션", "도서", "스포츠", "취미", "가구", "뷰티", "기타"];
const regions = ["서울 마포구", "서울 송파구", "경기 성남시", "부산 해운대구", "대전 유성구", "광주 북구"];
const nouns = ["노트북", "무선청소기", "트렌치코트", "소설 전집", "테니스 라켓", "보드게임", "원목 의자", "스킨케어 세트", "캠핑 랜턴"];
const images = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80"
];

function pad(prefix, index, width = 4) {
  return `${prefix}${String(index).padStart(width, "0")}`;
}

function dateFor(index) {
  const day = String((index % 28) + 1).padStart(2, "0");
  const hour = String(index % 24).padStart(2, "0");
  return `2026-09-${day}T${hour}:00:00.000Z`;
}

async function seed(db) {
  await clearData(db);

  for (let i = 1; i <= 100; i += 1) {
    await run(db, "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", [
      i,
      i === 1 ? "훈민마켓" : `동네판매자${i}`,
      regions[i % regions.length],
      `https://api.dicebear.com/8.x/initials/svg?seed=RM${i}`,
      70 + (i % 30),
      3 + (i % 48)
    ]);
  }

  for (let i = 1; i <= 180; i += 1) {
    const category = categories[(i - 1) % categories.length];
    const status = i === 18 || i % 11 === 0 ? "예약중" : i % 17 === 0 ? "거래완료" : "판매중";
    const sellerId = i <= 24 ? 1 : ((i % 99) + 2);
    const productId = pad("P", i);
    const createdAt = productId === "P0012" || productId === "P0018" ? `2026-10-10T${String(i).padStart(2, "0")}:00:00.000Z` : dateFor(i);
    await run(db, "INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      productId,
      `${regions[i % regions.length].split(" ")[0]} ${nouns[(i - 1) % nouns.length]} ${i}`,
      category,
      5000 + ((i * 7300) % 480000),
      regions[i % regions.length],
      sellerId,
      images[(i - 1) % images.length],
      `사용감은 있지만 관리가 잘 된 ${category} 상품입니다. 직거래와 예약 거래를 모두 지원합니다.`,
      status,
      1 + ((i * 7) % 35),
      createdAt
    ]);
  }

  for (let i = 1; i <= 200; i += 1) {
    const productId = pad("P", ((i * 5) % 180) + 1);
    const userId = ((i * 3) % 100) + 1;
    await run(db, "INSERT INTO favorites VALUES (?, ?, ?, ?)", [pad("F", i), userId, productId, dateFor(i)]);
  }

  for (let i = 1; i <= 120; i += 1) {
    const productIndex = ((i * 7) % 180) + 1;
    const productId = pad("P", productIndex);
    const sellerId = productIndex <= 24 ? 1 : ((productIndex % 99) + 2);
    const buyerId = i % 4 === 0 ? 1 : ((i * 9) % 100) + 1;
    const reservationId = pad("R", i);
    await run(db, "INSERT INTO reservations VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
      reservationId,
      productId,
      buyerId,
      sellerId,
      `2026-10-${String((i % 25) + 1).padStart(2, "0")} 오후 ${(i % 8) + 1}시`,
      "초기 예약 데이터",
      i % 5 === 0 ? "취소됨" : "예약중",
      dateFor(i)
    ]);
    await run(db, "INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
      pad("T", i),
      reservationId,
      productId,
      buyerId,
      sellerId,
      5000 + ((productIndex * 7300) % 480000),
      i % 6 === 0 ? "거래완료" : "예약중",
      i % 6 === 0 ? dateFor(i + 30) : null
    ]);
  }

  await run(db, "INSERT INTO reservations VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    "R9000",
    "P0018",
    2,
    1,
    "2026-10-18 오후 3시",
    "거래 완료 피드백 재현용 예약",
    "예약중",
    "2026-10-10T18:10:00.000Z"
  ]);
  await run(db, "INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    "T9000",
    "R9000",
    "P0018",
    2,
    1,
    5000 + ((18 * 7300) % 480000),
    "예약중",
    null
  ]);

  for (let i = 1; i <= 80; i += 1) {
    const productId = pad("P", ((i * 2) % 180) + 1);
    const buyerId = i % 3 === 0 ? 1 : ((i * 11) % 100) + 1;
    const sellerId = ((i * 2) % 180) + 1 <= 24 ? 1 : ((((i * 2) % 180) + 1) % 99) + 2;
    await run(db, "INSERT INTO chats VALUES (?, ?, ?, ?, ?)", [pad("C", i), productId, buyerId, sellerId, dateFor(i)]);
  }

  for (let i = 1; i <= 300; i += 1) {
    const chatId = pad("C", ((i - 1) % 80) + 1);
    const senderId = i % 2 === 0 ? 1 : ((i * 13) % 100) + 1;
    await run(db, "INSERT INTO messages VALUES (?, ?, ?, ?, ?)", [
      pad("M", i),
      chatId,
      senderId,
      i % 2 === 0 ? "네, 해당 시간에 거래 가능합니다." : "상품 상태와 거래 가능 시간을 알고 싶어요.",
      dateFor(i)
    ]);
  }

  for (let i = 1; i <= 100; i += 1) {
    await run(db, "INSERT INTO notifications VALUES (?, ?, ?, ?, ?)", [
      pad("N", i),
      i % 3 === 0 ? 1 : ((i * 17) % 100) + 1,
      `예약 및 채팅 알림 ${i}`,
      dateFor(i),
      i % 4 === 0 ? 1 : 0
    ]);
  }

  for (let i = 1; i <= 120; i += 1) {
    await run(db, "INSERT INTO activity VALUES (?, ?, ?, ?)", [
      pad("A", i),
      i % 4 === 0 ? 1 : ((i * 19) % 100) + 1,
      `상품 조회 및 거래 활동 ${i}`,
      dateFor(i)
    ]);
  }
}

module.exports = { seed, categories };
