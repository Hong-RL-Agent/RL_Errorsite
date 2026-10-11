const { run, clearData } = require("./init");

const genres = ["액션", "드라마", "SF", "스릴러", "로맨스", "애니메이션", "다큐멘터리"];
const ratings = ["전체관람가", "12세", "15세", "청소년관람불가"];
const posters = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80"
];

function pad(prefix, index, width = 4) {
  return `${prefix}${String(index).padStart(width, "0")}`;
}

function dateFor(index) {
  return `2026-10-${String((index % 20) + 10).padStart(2, "0")}T${String(8 + (index % 12)).padStart(2, "0")}:00:00.000Z`;
}

async function seed(db) {
  await clearData(db);

  for (let i = 1; i <= 70; i += 1) {
    await run(db, "INSERT INTO movies VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      pad("M", i),
      `CineWave 작품 ${i}`,
      genres[i % genres.length],
      90 + (i % 50),
      ratings[i % ratings.length],
      `도시의 밤과 극장의 빛을 배경으로 펼쳐지는 ${genres[i % genres.length]} 영화입니다. 예매 테스트에 적합한 고정 상영 데이터를 제공합니다.`,
      `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      posters[i % posters.length],
      i % 5 === 0 ? "상영예정" : "현재상영"
    ]);
  }

  for (let i = 1; i <= 20; i += 1) {
    await run(db, "INSERT INTO theaters VALUES (?, ?, ?, ?)", [pad("TH", i, 3), `CineWave ${i}관`, ["서울", "부산", "대전", "광주", "성남"][i % 5], `중앙로 ${i * 7}`]);
  }

  for (let i = 1; i <= 60; i += 1) {
    const theaterId = pad("TH", ((i - 1) % 20) + 1, 3);
    await run(db, "INSERT INTO screens VALUES (?, ?, ?, ?)", [pad("SC", i, 3), theaterId, `${((i - 1) % 8) + 1}관`, i % 3 === 0 ? "IMAX" : i % 3 === 1 ? "COMFORT" : "STANDARD"]);
  }

  for (let i = 1; i <= 60; i += 1) {
    const screenId = pad("SC", i, 3);
    const rows = i % 2 === 0 ? ["A", "B", "C", "D"] : ["A", "B", "C", "D", "E"];
    for (const row of rows) {
      for (let n = 1; n <= 6; n += 1) {
        const index = (i - 1) * 30 + rows.indexOf(row) * 6 + n;
        await run(db, "INSERT INTO seats VALUES (?, ?, ?, ?, ?, ?)", [`S${screenId}${row}${String(n).padStart(2, "0")}`, screenId, row, n, `${row}${n}`, row === "A" ? 12000 : 14000]);
      }
    }
  }

  for (let i = 1; i <= 250; i += 1) {
    const screenId = pad("SC", ((i - 1) % 60) + 1, 3);
    const theaterId = pad("TH", (((i - 1) % 60) % 20) + 1, 3);
    await run(db, "INSERT INTO showtimes VALUES (?, ?, ?, ?, ?)", [pad("ST", i), pad("M", ((i - 1) % 70) + 1), theaterId, screenId, dateFor(i)]);
  }

  for (let i = 1; i <= 100; i += 1) {
    await run(db, "INSERT INTO customers VALUES (?, ?, ?, ?)", [i, i === 1 ? "테스트고객" : `관객${i}`, `guest${i}@cinewave.test`, i % 10 === 0 ? "VIP" : "BASIC"]);
  }

  const fixedBookings = [
    ["B0001", 1, "ST0001", "예매확정", ["SSC001A01"], 12000],
    ["B0002", 1, "ST0002", "예매확정", ["SSC002A01"], 12000],
    ["B0003", 1, "ST0003", "예매취소", ["SSC003A01"], 12000],
    ["B0004", 1, "ST0004", "예매확정", ["SSC004A01"], 12000]
  ];
  for (const [id, customerId, showtimeId, status, seatIds, total] of fixedBookings) {
    await run(db, "INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, customerId, showtimeId, status, total, dateFor(1), dateFor(1), 0]);
    for (const seatId of seatIds) {
      await run(db, "INSERT INTO booking_seats VALUES (?, ?)", [id, seatId]);
    }
  }

  for (let i = 5; i <= 180; i += 1) {
    const showtimeIndex = ((i * 3) % 250) + 1;
    const screenIndex = ((showtimeIndex - 1) % 60) + 1;
    const seatId = `S${pad("SC", screenIndex, 3)}${["A", "B", "C", "D"][i % 4]}${String((i % 6) + 1).padStart(2, "0")}`;
    const status = i % 9 === 0 ? "예매취소" : "예매확정";
    await run(db, "INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [pad("B", i), ((i * 7) % 100) + 1, pad("ST", showtimeIndex), status, 14000, dateFor(i), dateFor(i), 0]);
    await run(db, "INSERT OR IGNORE INTO booking_seats VALUES (?, ?)", [pad("B", i), seatId]);
  }

  for (let i = 1; i <= 160; i += 1) {
    await run(db, "INSERT INTO seat_change_logs VALUES (?, ?, ?, ?, ?)", [pad("CH", i), pad("B", ((i % 176) + 5)), `A${(i % 6) + 1}`, `B${(i % 6) + 1}`, dateFor(i)]);
  }

  for (let i = 1; i <= 80; i += 1) {
    await run(db, "INSERT INTO cancellation_logs VALUES (?, ?, ?, ?)", [pad("CL", i), i === 1 ? "B0003" : pad("B", ((i % 176) + 5)), "사용자 취소", dateFor(i)]);
  }

  for (let i = 1; i <= 100; i += 1) {
    await run(db, "INSERT INTO notifications VALUES (?, ?, ?, ?, ?)", [pad("N", i), i % 4 === 0 ? 1 : ((i * 11) % 100) + 1, `상영 및 예매 알림 ${i}`, i % 5 === 0 ? 1 : 0, dateFor(i)]);
  }

  for (let i = 1; i <= 120; i += 1) {
    await run(db, "INSERT INTO activity VALUES (?, ?, ?, ?)", [pad("A", i), i % 3 === 0 ? 1 : ((i * 13) % 100) + 1, `영화 조회 및 예매 활동 ${i}`, dateFor(i)]);
  }
}

module.exports = { seed };
