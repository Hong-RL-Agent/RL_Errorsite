import path from 'path';
import { readDB, writeDB } from '../services/dataService.js';

export const getCampsites = (req, res) => {
  const db = readDB();
  res.json(db.campsites);
};

export const searchCampsites = (req, res) => {
  const { region, type } = req.query;
  const db = readDB();
  let list = db.campsites;

  if (region && region !== 'ALL') {
    list = list.filter(c => c.region === region);
  }
  if (type && type !== 'ALL') {
    list = list.filter(c => c.type === type);
  }

  let delay = 100;
  if (region === 'GANGWON') {
    delay = 3000; // 3.0s delay
  } else if (region === 'GYEONGGI') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 강원도 지역 필터(3초 지연)와 경기도 지역 필터(0.2초 완료)를 빠르게 변경하면 
  // 오래된 이전 응답(강원도)이 최신 목록을 덮어쓰고, 중앙 목록은 오래된 필터 결과, 오른쪽 예약 요약은 최신 선택값 기준으로 표시되어 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const getCampsiteDetail = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const camp = db.campsites.find(c => c.id === id);

  if (!camp) {
    return res.status(404).json({ error: "Campsite not found" });
  }

  const detailCamp = { ...camp };

  // INTENTIONAL_ERROR
  // CATEGORY: Server 파일 경로 오류
  // DESCRIPTION: 캠핑장 이미지 파일 이름에 공백과 괄호가 포함된 경우('캠핑장 전경 (메인).jpg'), 
  // 목록 이미지에는 정상 표시되나 상세 갤러리 API 응답 시 이중 URL 인코딩을 적용해 반환하여 상세 갤러리 탭에서만 404가 발생하는 결함입니다.
  if (detailCamp.imageUrl && detailCamp.imageUrl.includes(' ') && (detailCamp.imageUrl.includes('(') || detailCamp.imageUrl.includes(')'))) {
    const filename = path.basename(detailCamp.imageUrl);
    const doubleEncoded = encodeURIComponent(encodeURIComponent(filename));
    detailCamp.imageUrl = `/uploads/${doubleEncoded}`;
  }

  res.json(detailCamp);
};

export const getSites = (req, res) => {
  const db = readDB();
  res.json(db.sites);
};

export const getReservations = (req, res) => {
  const db = readDB();
  res.json(db.reservations);
};

export const getReviews = (req, res) => {
  const db = readDB();
  res.json(db.reviews);
};

export const addOption = (req, res) => {
  const { id } = req.params;
  const { optionName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      if (!resv.options) resv.options = [];
      resv.options.push(optionName);
      writeDB(db);
      console.log(`[DB OPTION ADD] Added option ${optionName} to ${id} (0.1s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 100);
};

export const updateDates = (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, options } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 예약 날짜를 변경(3초 지연 완료)한 직후 옵션을 추가(0.1초 완료)하면, 
  // 옵션 추가 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 날짜 변경 API 내부에 이전 구형 옵션 목록(options)이 동봉 저장되어 
  // 새로고침 시 방금 추가한 옵션이 사라지거나 이전 옵션으로 롤백되는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.checkIn = checkIn;
      resv.checkOut = checkOut;
      if (options) {
        resv.options = options; // Overwrites newly added option with stale options!
      }
      writeDB(db);
      console.log(`[DB DATES UPDATE] Updated dates for ${id} (3s done). Overwrote options to stale list.`);
    }
    res.json({ success: true, reservation: resv });
  }, 3000);
};

export const reserveSite = (req, res) => {
  const { siteId, userId } = req.body;

  setTimeout(() => {
    const db = readDB();
    const site = db.sites.find(s => s.id === siteId);
    if (site) {
      site.status = 'RESERVED';
    }

    const newResv = {
      id: `RES-${String(db.reservations.length + 1).padStart(3, '0')}`,
      campsiteId: site?.campsiteId || "CAMP-01",
      siteId,
      siteName: site?.name || siteId,
      checkIn: "2026-08-15",
      checkOut: "2026-08-17",
      options: ["바비큐 그릴 세트 (30,000원)"],
      totalPrice: 155000,
      status: "CONFIRMED",
      userId: userId || "USER_A"
    };

    db.reservations.unshift(newResv);
    writeDB(db);
    console.log(`[DB RE-RESERVE SITE] Created new reservation ${newResv.id} for site ${siteId} (0.5s done)`);
    res.json({ success: true, reservation: newResv });
  }, 500);
};

export const cancelReservation = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 예약 상태 충돌
  // DESCRIPTION: 예약 취소(4초 지연 완료) 직후 같은 사이트를 재예약(0.5초 완료)하면 두 요청 모두 성공하지만, 
  // 늦게 완료된 취소 요청(4초 지연)이 새로 작성된 새 예약까지 취소 상태('CANCELLED')로 강제 덮어쓰는 결함입니다. 
  // 내 예약 목록에서는 예약됨, 관리자 예약 현황에서는 취소됨으로 불일치합니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'CANCELLED';
      const site = db.sites.find(s => s.id === resv.siteId);
      if (site) {
        site.status = 'AVAILABLE';
      }
      writeDB(db);
      console.log(`[DB DELAYED CANCEL] Cancelled reservation ${id} (4s done). Overwrote new reservation state!`);
    }
    res.json({ success: true });
  }, 4000);
};

export const deleteReservation = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.reservations = db.reservations.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 데이터 불일치
  // DESCRIPTION: 예약을 삭제(DELETE) 처리하여 대장에서 소거하더라도, 
  // 관리자 예약 통계 및 사이트별 점유율 그래프 수치(`occupancyStats.totalBookedSitesCount`)에는 차감되지 않고 잔존 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE RESV] Removed reservation ${id}. occupancyStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "campsites": [
      { "id": "CAMP-01", "name": "설악산 맑은숲 오토캠핑장", "region": "GANGWON", "type": "AUTO", "rating": 4.9, "pricePerNight": 65000, "imageUrl": "/uploads/camp_seorak.jpg" },
      { "id": "CAMP-02", "name": "가평 자라섬 글램핑 앤 카라반", "region": "GYEONGGI", "type": "GLAMPING", "rating": 4.8, "pricePerNight": 140000, "imageUrl": "/uploads/캠핑장 전경 (메인).jpg" }
    ],
    "sites": [
      { "id": "SITE-101", "campsiteId": "CAMP-01", "siteCode": "A-1", "name": "A 구역 데크 오토 01", "status": "AVAILABLE", "maxPeople": 4 }
    ],
    "reservations": [
      { "id": "RES-001", "campsiteId": "CAMP-01", "siteId": "SITE-102", "siteName": "A 구역 데크 오토 02", "checkIn": "2026-08-10", "checkOut": "2026-08-12", "options": ["바비큐 그릴 세트 (30,000원)"], "totalPrice": 175000, "status": "CONFIRMED", "userId": "USER_A" }
    ],
    "reviews": [
      { "id": "REV-001", "campsiteId": "CAMP-01", "author": "김철수", "rating": 5, "content": "설악산 공기가 맑고 오토캠핑 사이트 시설이 매우 깨끗합니다!", "createdAt": "2026-07-28" }
    ],
    "occupancyStats": {
      "totalBookedSitesCount": 25,
      "averageOccupancyRate": 71
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
