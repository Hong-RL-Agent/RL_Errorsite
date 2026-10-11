const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { openDb, run, all, get, createSchema } = require("./db/init");
const { seed } = require("./db/seed");

const PORT = 9718;
fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });

const db = openDb();
const app = express();

app.use(cors({ origin: "http://localhost:5319" }));
app.use(express.json());

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function now() {
  return new Date().toISOString();
}

function uid(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

async function logActivity(customerId, message) {
  await run(db, "INSERT INTO activity VALUES (?, ?, ?, ?)", [uid("A"), customerId || 1, message, now()]);
}

async function notify(customerId, message) {
  await run(db, "INSERT INTO notifications VALUES (?, ?, ?, ?, ?)", [uid("N"), customerId || 1, message, 0, now()]);
}

async function bootstrap() {
  await createSchema(db);
  const row = await get(db, "SELECT COUNT(*) AS count FROM movies");
  if (!row || row.count === 0) {
    await seed(db);
  }
}

async function bookingRows(where, params) {
  const rows = await all(db, `SELECT b.*, m.title AS movieTitle, t.name AS theaterName, sc.name AS screenName, st.startsAt,
      GROUP_CONCAT(s.seatLabel, ', ') AS seatLabels
    FROM bookings b
    JOIN showtimes st ON st.id = b.showtimeId
    JOIN movies m ON m.id = st.movieId
    JOIN theaters t ON t.id = st.theaterId
    JOIN screens sc ON sc.id = st.screenId
    LEFT JOIN booking_seats bs ON bs.bookingId = b.id
    LEFT JOIN seats s ON s.id = bs.seatId
    ${where}
    GROUP BY b.id
    ORDER BY b.createdAt DESC`, params);
  return rows;
}

async function getSeatRows(showtimeId) {
  const showtime = await get(db, "SELECT * FROM showtimes WHERE id = ?", [showtimeId]);
  if (!showtime) return null;
  const rows = await all(db, `SELECT s.*,
      CASE WHEN EXISTS (
        SELECT 1 FROM booking_seats bs
        JOIN bookings b ON b.id = bs.bookingId
        WHERE bs.seatId = s.id AND b.showtimeId = ? AND b.status = '예매확정' AND b.deleted = 0
      ) THEN 'booked' ELSE 'available' END AS status
    FROM seats s
    WHERE s.screenId = ?
    ORDER BY s.rowLabel ASC, s.seatNumber ASC`, [showtimeId, showtime.screenId]);
  return rows;
}

async function assertSeatsAvailable(showtime, seatIds, ignoreBookingId = null) {
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    const error = new Error("좌석을 선택해야 합니다.");
    error.status = 400;
    throw error;
  }
  const placeholders = seatIds.map(() => "?").join(",");
  const seats = await all(db, `SELECT * FROM seats WHERE id IN (${placeholders}) AND screenId = ?`, [...seatIds, showtime.screenId]);
  if (seats.length !== seatIds.length) {
    const error = new Error("같은 상영관의 유효한 좌석만 선택할 수 있습니다.");
    error.status = 400;
    throw error;
  }
  const ignoreClause = ignoreBookingId ? "AND b.id <> ?" : "";
  const params = ignoreBookingId ? [showtime.id, ...seatIds, ignoreBookingId] : [showtime.id, ...seatIds];
  const taken = await all(db, `SELECT bs.seatId FROM booking_seats bs
    JOIN bookings b ON b.id = bs.bookingId
    WHERE b.showtimeId = ? AND bs.seatId IN (${placeholders}) AND b.status = '예매확정' AND b.deleted = 0 ${ignoreClause}`, params);
  if (taken.length) {
    const error = new Error("이미 예매된 좌석이 포함되어 있습니다.");
    error.status = 409;
    throw error;
  }
  return seats;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, siteId: "B-04", name: "CineWave", strategy: "ACTION_REPLAY" });
});

app.get("/api/movies", asyncHandler(async (req, res) => {
  const conditions = [];
  const params = [];
  if (req.query.q) {
    conditions.push("title LIKE ?");
    params.push(`%${req.query.q}%`);
  }
  if (req.query.genre) {
    conditions.push("genre = ?");
    params.push(req.query.genre);
  }
  if (req.query.status) {
    conditions.push("status = ?");
    params.push(req.query.status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  res.json({ items: await all(db, `SELECT * FROM movies ${where} ORDER BY id ASC`, params) });
}));

app.get("/api/movies/:id", asyncHandler(async (req, res) => {
  const movie = await get(db, "SELECT * FROM movies WHERE id = ?", [req.params.id]);
  if (!movie) return res.status(404).json({ error: "영화를 찾을 수 없습니다." });
  res.json({ movie });
}));

app.get("/api/theaters", asyncHandler(async (req, res) => {
  const q = req.query.q ? "WHERE name LIKE ? OR city LIKE ?" : "";
  const params = req.query.q ? [`%${req.query.q}%`, `%${req.query.q}%`] : [];
  res.json({ items: await all(db, `SELECT * FROM theaters ${q} ORDER BY id ASC`, params) });
}));

app.get("/api/theaters/:id", asyncHandler(async (req, res) => {
  const theater = await get(db, "SELECT * FROM theaters WHERE id = ?", [req.params.id]);
  if (!theater) return res.status(404).json({ error: "영화관을 찾을 수 없습니다." });
  res.json({ theater });
}));

app.get("/api/screens", asyncHandler(async (req, res) => {
  res.json({ items: await all(db, "SELECT * FROM screens ORDER BY id ASC") });
}));

app.get("/api/showtimes", asyncHandler(async (req, res) => {
  const conditions = [];
  const params = [];
  if (req.query.movieId) {
    conditions.push("st.movieId = ?");
    params.push(req.query.movieId);
  }
  if (req.query.theaterId) {
    conditions.push("st.theaterId = ?");
    params.push(req.query.theaterId);
  }
  if (req.query.date) {
    conditions.push("substr(st.startsAt, 1, 10) = ?");
    params.push(req.query.date);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const items = await all(db, `SELECT st.*, m.title AS movieTitle, t.name AS theaterName, sc.name AS screenName,
      (SELECT COUNT(*) FROM seats s WHERE s.screenId = st.screenId) -
      (SELECT COUNT(*) FROM booking_seats bs JOIN bookings b ON b.id = bs.bookingId WHERE b.showtimeId = st.id AND b.status = '예매확정' AND b.deleted = 0) AS availableSeats
    FROM showtimes st
    JOIN movies m ON m.id = st.movieId
    JOIN theaters t ON t.id = st.theaterId
    JOIN screens sc ON sc.id = st.screenId
    ${where}
    ORDER BY st.startsAt ASC`, params);
  res.json({ items });
}));

app.get("/api/showtimes/:id", asyncHandler(async (req, res) => {
  const showtime = await get(db, `SELECT st.*, m.title AS movieTitle, t.name AS theaterName, sc.name AS screenName
    FROM showtimes st JOIN movies m ON m.id = st.movieId JOIN theaters t ON t.id = st.theaterId JOIN screens sc ON sc.id = st.screenId
    WHERE st.id = ?`, [req.params.id]);
  if (!showtime) return res.status(404).json({ error: "상영시간을 찾을 수 없습니다." });
  res.json({ showtime });
}));

app.get("/api/showtimes/:id/seats", asyncHandler(async (req, res) => {
  const items = await getSeatRows(req.params.id);
  if (!items) return res.status(404).json({ error: "상영시간을 찾을 수 없습니다." });
  res.json({ items });
}));

app.get("/api/customers", asyncHandler(async (req, res) => {
  res.json({ items: await all(db, "SELECT * FROM customers ORDER BY id ASC") });
}));

app.get("/api/bookings", asyncHandler(async (req, res) => {
  const customerId = Number(req.query.customerId || 1);
  res.json({ items: await bookingRows("WHERE b.customerId = ? AND b.deleted = 0", [customerId]) });
}));

app.get("/api/bookings/:id", asyncHandler(async (req, res) => {
  const rows = await bookingRows("WHERE b.id = ? AND b.deleted = 0", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "예매를 찾을 수 없습니다." });
  res.json({ booking: rows[0] });
}));

app.post("/api/bookings", asyncHandler(async (req, res) => {
  const { customerId = 1, showtimeId, seatIds } = req.body;
  const showtime = await get(db, "SELECT * FROM showtimes WHERE id = ?", [showtimeId]);
  if (!showtime) return res.status(404).json({ error: "상영시간을 찾을 수 없습니다." });
  await run(db, "BEGIN IMMEDIATE TRANSACTION");
  try {
    const seats = await assertSeatsAvailable(showtime, seatIds);
    const id = uid("B");
    const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
    await run(db, "INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, customerId, showtimeId, "예매확정", totalPrice, now(), now(), 0]);
    for (const seatId of seatIds) {
      await run(db, "INSERT INTO booking_seats VALUES (?, ?)", [id, seatId]);
    }
    await run(db, "COMMIT");
    await notify(customerId, `${showtimeId} 예매가 완료되었습니다.`);
    await logActivity(customerId, `${showtimeId} 예매를 생성했습니다.`);
    const rows = await bookingRows("WHERE b.id = ?", [id]);
    res.status(201).json({ booking: rows[0] });
  } catch (error) {
    await run(db, "ROLLBACK").catch(() => {});
    throw error;
  }
}));

app.patch("/api/bookings/:id", asyncHandler(async (req, res) => {
  const booking = await get(db, "SELECT * FROM bookings WHERE id = ? AND deleted = 0", [req.params.id]);
  if (!booking) return res.status(404).json({ error: "예매를 찾을 수 없습니다." });
  await run(db, "UPDATE bookings SET status = COALESCE(?, status), updatedAt = ? WHERE id = ?", [req.body.status, now(), req.params.id]);
  await logActivity(booking.customerId, `${req.params.id} 예매 정보를 수정했습니다.`);
  res.json({ ok: true });
}));

app.post("/api/bookings/:id/cancel", asyncHandler(async (req, res) => {
  const booking = await get(db, "SELECT * FROM bookings WHERE id = ? AND deleted = 0", [req.params.id]);
  if (!booking) return res.status(404).json({ error: "예매를 찾을 수 없습니다." });
  await run(db, "UPDATE bookings SET status = ?, updatedAt = ? WHERE id = ?", ["예매취소", now(), req.params.id]);
  await run(db, "INSERT INTO cancellation_logs VALUES (?, ?, ?, ?)", [uid("CL"), req.params.id, "사용자 취소", now()]);
  await notify(booking.customerId, `${req.params.id} 예매가 취소되었습니다.`);
  await logActivity(booking.customerId, `${req.params.id} 예매를 취소했습니다.`);
  res.json({ ok: true });
}));

app.patch("/api/bookings/:id/seats", asyncHandler(async (req, res) => {
  const booking = await get(db, "SELECT * FROM bookings WHERE id = ? AND deleted = 0", [req.params.id]);
  if (!booking) return res.status(404).json({ error: "예매를 찾을 수 없습니다." });
  if (booking.status !== "예매확정") return res.status(409).json({ error: "확정 예매만 좌석을 변경할 수 있습니다." });
  const showtime = await get(db, "SELECT * FROM showtimes WHERE id = ?", [booking.showtimeId]);
  await run(db, "BEGIN IMMEDIATE TRANSACTION");
  try {
    const before = await all(db, "SELECT s.seatLabel FROM booking_seats bs JOIN seats s ON s.id = bs.seatId WHERE bs.bookingId = ?", [req.params.id]);
    const seats = await assertSeatsAvailable(showtime, req.body.seatIds, req.params.id);
    await run(db, "DELETE FROM booking_seats WHERE bookingId = ?", [req.params.id]);
    for (const seatId of req.body.seatIds) {
      await run(db, "INSERT INTO booking_seats VALUES (?, ?)", [req.params.id, seatId]);
    }
    await run(db, "UPDATE bookings SET totalPrice = ?, updatedAt = ? WHERE id = ?", [seats.reduce((sum, seat) => sum + seat.price, 0), now(), req.params.id]);
    await run(db, "INSERT INTO seat_change_logs VALUES (?, ?, ?, ?, ?)", [uid("CH"), req.params.id, before.map((seat) => seat.seatLabel).join(","), seats.map((seat) => seat.seatLabel).join(","), now()]);
    await run(db, "COMMIT");
    await logActivity(booking.customerId, `${req.params.id} 좌석을 변경했습니다.`);
    res.json({ ok: true });
  } catch (error) {
    await run(db, "ROLLBACK").catch(() => {});
    throw error;
  }
}));

app.delete("/api/bookings/:id", asyncHandler(async (req, res) => {
  const booking = await get(db, "SELECT * FROM bookings WHERE id = ? AND deleted = 0", [req.params.id]);
  if (!booking) return res.status(404).json({ error: "예매를 찾을 수 없습니다." });
  if (booking.status !== "예매취소") return res.status(409).json({ error: "취소된 예매 내역만 삭제할 수 있습니다." });
  await run(db, "UPDATE bookings SET deleted = 1, updatedAt = ? WHERE id = ?", [now(), req.params.id]);
  await logActivity(booking.customerId, `${req.params.id} 예매 내역을 삭제했습니다.`);
  res.json({ ok: true });
}));

app.get("/api/booking-statistics", asyncHandler(async (req, res) => {
  const customerId = Number(req.query.customerId || 1);
  const rows = await all(db, "SELECT status, COUNT(*) AS count FROM bookings WHERE customerId = ? AND deleted = 0 GROUP BY status", [customerId]);
  const statistics = { confirmed: 0, canceled: 0, total: 0 };
  for (const row of rows) {
    if (row.status === "예매확정") statistics.confirmed = row.count;
    if (row.status === "예매취소") statistics.canceled = row.count;
    statistics.total += row.count;
  }
  res.json({ statistics });
}));

app.get("/api/notifications", asyncHandler(async (req, res) => {
  const customerId = Number(req.query.customerId || 1);
  res.json({ items: await all(db, "SELECT * FROM notifications WHERE customerId = ? ORDER BY createdAt DESC", [customerId]) });
}));

app.patch("/api/notifications/:id/read", asyncHandler(async (req, res) => {
  await run(db, "UPDATE notifications SET read = 1 WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
}));

app.get("/api/activity", asyncHandler(async (req, res) => {
  const customerId = Number(req.query.customerId || 1);
  res.json({ items: await all(db, "SELECT * FROM activity WHERE customerId = ? ORDER BY createdAt DESC", [customerId]) });
}));

app.post("/api/test/reset", asyncHandler(async (req, res) => {
  await seed(db);
  res.json({ ok: true, restored: true, siteId: "B-04" });
}));

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({ error: status >= 500 ? "서버 요청 처리 중 오류가 발생했습니다." : error.message });
});

bootstrap().then(() => {
  app.listen(PORT, () => {
    console.log(`CineWave B-04 API listening on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
