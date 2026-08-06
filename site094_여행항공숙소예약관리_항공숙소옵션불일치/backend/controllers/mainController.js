import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getUsers = (req, res) => {
  const db = readDB();
  res.json(db.users);
};

export const getDestinations = (req, res) => {
  const db = readDB();
  res.json(db.destinations);
};

export const getFlights = (req, res) => {
  const db = readDB();
  res.json(db.flights);
};

export const getHotels = (req, res) => {
  const db = readDB();
  res.json(db.hotels);
};

export const getOptions = (req, res) => {
  const db = readDB();
  res.json(db.options);
};

export const getBookings = (req, res) => {
  const db = readDB();
  res.json(db.bookings);
};

export const searchFlights = (req, res) => {
  const { destination } = req.query;
  const db = readDB();
  let list = db.flights;

  if (destination && destination !== 'ALL') {
    list = list.filter(f => f.destination === destination);
  }

  let delay = 100;
  if (destination === '다낭') {
    delay = 3000; // 3.0s delay for 다낭
  } else if (destination === '도쿄') {
    delay = 200; // 0.2s delay for 도쿄
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 여행지 필터('다낭' 3초 지연 ➔ '도쿄' 0.2초 완료)를 빠르게 변경 시 
  // 오래된 이전 응답(다낭)이 최신 항공편 목록을 덮어쓰고, 중앙 항공편 목록은 오래된 결과, 오른쪽 예약 요약은 최신 선택 기준 가격으로 표시되어 어긋나는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateBookingHotel = (req, res) => {
  const { id } = req.params;
  const { hotelId, hotelInfo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 예약에서 숙소를 변경(3초 지연 완료)한 직후 항공편을 변경(0.1초 완료)하면, 
  // 항공편 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 숙소 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 항공편)을 덮어써 저장되어 
  // 새로고침 시 예약 요약의 항공편과 내 예약 상세의 항공편이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const booking = dbSnapshot.bookings.find(b => b.id === id);
    if (booking) {
      booking.hotelId = hotelId;
      booking.hotelInfo = hotelInfo;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back flight changes made during the 3s delay
      console.log(`[DB HOTEL UPDATE] Updated hotel for booking ${id} (3s done, rolled back flight update)`);
    }
    res.json({ success: true, booking });
  }, 3000);
};

export const updateBookingFlight = (req, res) => {
  const { id } = req.params;
  const { flightId, flightInfo } = req.body;

  setTimeout(() => {
    const db = readDB();
    const booking = db.bookings.find(b => b.id === id);
    if (booking) {
      booking.flightId = flightId;
      booking.flightInfo = flightInfo;
      writeDB(db);
      console.log(`[DB FLIGHT UPDATE] Updated flight for booking ${id} to ${flightId} (0.1s done)`);
    }
    res.json({ success: true, booking });
  }, 100);
};

export const cancelBooking = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const booking = db.bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL BOOKING] Booking ${id} cancelled (0.5s done)`);
    }
    res.json({ success: true, booking });
  }, 500);
};

export const addBookingOption = (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 여행 옵션 추가 API를 호출(4초 지연 완료)하면, 
  // 예약 취소는 성공하여 CANCELLED로 바뀌지만 늦게 완료된 옵션 추가 요청(4초 지연)이 취소된 예약을 'CONFIRMED'(예약확정) 상태로 다시 바꿔버립니다. 
  // 내 예약 목록에서는 취소됨, 관리자 예약 현황에서는 예약확정으로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const booking = db.bookings.find(b => b.id === id);
    if (booking) {
      if (!booking.options) booking.options = [];
      if (!booking.options.includes(optionId)) {
        booking.options.push(optionId);
      }
      booking.status = 'CONFIRMED'; // Re-activates booking back to CONFIRMED!
      console.log(`[DB RE-ACTIVATE BOOKING STATUS] Re-activated booking ${id} back to CONFIRMED status!`);
    }
    writeDB(db);
    res.json({ success: true, booking });
  }, 4000);
};

export const confirmBooking = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 예약 확정 API를 호출하면 HTTP 403을 반환하지만, 
  // 활동 로그에는 '예약 확정 성공 (BOOKING CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 보안감사 불일치 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] BOOKING CONFIRMED SUCCESSFULLY for booking ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  const booking = db.bookings.find(b => b.id === id);
  if (booking) {
    booking.status = 'CONFIRMED';
    writeDB(db);
  }
  res.json({ success: true, booking });
};

export const updateTravelerPartial = (req, res) => {
  const { id } = req.params;
  const { passportName, phone, specialRequest } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 예약자 정보 수정 모달에서 여권 영문명, 연락처, 요청사항을 동시에 수정하면, 
  // backend data.json에는 영문명(passportName)과 요청사항(specialRequest)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const booking = db.bookings.find(b => b.id === id);
  if (booking) {
    if (specialRequest) booking.specialRequest = specialRequest;
    const user = db.users.find(u => u.id === booking.userId);
    if (user) {
      if (passportName) user.passportName = passportName;
      // phone is INTENTIONALLY NOT UPDATED!
    }
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated passportName and specialRequest for booking ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, booking });
};

export const deleteBookingOption = (req, res) => {
  const { id, optionId } = req.params;
  const db = readDB();

  const booking = db.bookings.find(b => b.id === id);
  if (booking && booking.options) {
    booking.options = booking.options.filter(o => o !== optionId);
    // INTENTIONAL_ERROR
    // CATEGORY: 통계 집계 불일치
    // DESCRIPTION: 여행 옵션을 삭제(`DELETE /api/bookings/:id/options/:optionId`) 처리하여 예약 상세 옵션 목록에서 소거하더라도, 
    // 총 예약 금액(`booking.totalPrice`), 옵션별 판매량, 관리자 매출 통계 수치에는 차감되지 않고 계속 잔존 포함되는 결함입니다.
    writeDB(db);
    console.log(`[DB DELETE OPTION] Removed option ${optionId} from booking ${id}. totalPrice remains unchanged.`);
  }
  res.json({ success: true, booking });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-01", "name": "김여행 (패키지 총괄 대표)", "role": "ADMIN", "dept": "여행 운영팀" },
      { "id": "ADM-02", "name": "이항공 (항공/숙소 매니저)", "role": "ADMIN", "dept": "상품 수급팀" },
      { "id": "ADM-03", "name": "박고객 (CS 운영 사원)", "role": "STAFF", "dept": "고객지원팀" }
    ],
    "users": [
      { "id": "USR-101", "name": "김동남 (VIP)", "passportName": "KIM DONGNAM", "phone": "010-1111-2222", "email": "kim@example.com" }
    ],
    "destinations": [
      { "id": "DST-01", "name": "다낭", "country": "베트남", "category": "동남아 휴양지", "image": "🌴", "popularScore": 98 }
    ],
    "flights": [
      { "id": "FLT-201", "airline": "대한항공 (KE657)", "destination": "다낭", "depTime": "09:00", "arrTime": "12:15", "price": 480000, "seats": 12 }
    ],
    "hotels": [
      { "id": "HTL-301", "name": "다낭 메리어트 리조트 & 스파", "destination": "다낭", "grade": "5성급", "pricePerNight": 240000, "rating": 4.9 }
    ],
    "options": [
      { "id": "OPT-401", "name": "공항 단독 단독 샌딩/픽업 카", "price": 45000, "category": "교통" }
    ],
    "bookings": [
      { "id": "BKG-5001", "userId": "USR-101", "userName": "김동남", "destination": "다낭", "flightId": "FLT-201", "flightInfo": "대한항공 (KE657) - 480,000원", "hotelId": "HTL-301", "hotelInfo": "다낭 메리어트 리조트 - 240,000원/박", "nights": 3, "options": ["OPT-401"], "totalPrice": 1330000, "status": "CONFIRMED", "createdAt": "2026-08-03 10:00:00" }
    ],
    "travelStats": {
      "totalDestinations": 18,
      "totalFlights": 30,
      "totalHotels": 25,
      "totalBookings": 30,
      "totalRevenue": 48927000
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
