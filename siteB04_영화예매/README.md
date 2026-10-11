# CineWave (B-04)

CineWave는 영화 상영 정보, 좌석 예매, 티켓 및 관람 일정 관리를 제공하는 학습용 영화 예매 서비스입니다.

- 사이트 ID: B-04
- 학습 용도: Training
- 확인전략: ACTION_REPLAY
- Frontend: Next.js App Router, React
- Backend: Node.js, Express
- DB: SQLite

## 실행 포트

- Backend: http://localhost:9718
- Frontend: http://localhost:5319
- 브라우저 접속: http://localhost:5319

## 실행 방법

Backend:

```bash
cd siteB04_영화예매/backend
npm install
npm run dev
```

Frontend:

```bash
cd siteB04_영화예매/frontend
npm install
npm run dev
```

## 정상 기능

- 영화 제목 검색
- 영화 장르 필터
- 현재 상영작 및 상영 예정작 필터
- 영화 상세 조회
- 영화관 지점 검색 및 선택
- 날짜 선택
- 상영시간 조회
- 좌석 상태 조회
- 좌석 선택 및 선택 취소
- 좌석별 가격 조회
- 예매 신청
- 예매 내역 조회
- 예매 상세 조회
- 좌석 변경
- 예매 취소
- 예매 내역 삭제
- 티켓 상세 표시
- 예약 건수 조회
- 알림 읽음 처리
- 활동 로그 조회
- 데이터 초기화

## API 엔드포인트

```text
GET    /api/health
GET    /api/movies
GET    /api/movies/:id
GET    /api/theaters
GET    /api/theaters/:id
GET    /api/screens
GET    /api/showtimes
GET    /api/showtimes/:id
GET    /api/showtimes/:id/seats
GET    /api/customers
GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings
PATCH  /api/bookings/:id
POST   /api/bookings/:id/cancel
PATCH  /api/bookings/:id/seats
DELETE /api/bookings/:id
GET    /api/booking-statistics
GET    /api/notifications
PATCH  /api/notifications/:id/read
GET    /api/activity
POST   /api/test/reset
```

## 의도적 오류 5개

1. B04-ERR01: 예매 확정 이벤트 중복 실행
2. B04-ERR02: 예매 취소 후 현황 캐시 불일치
3. B04-ERR03: 좌석 변경 성공 메시지 누락
4. B04-ERR04: 예매 내역 삭제 확인 누락
5. B04-ERR05: 좌석 변경 모달의 취소 경로 차단

## 오류 재현 시나리오

- B04-ERR01: 특정 영화와 상영시간을 선택하고 빈 좌석 2개 이상을 선택한 뒤 예매 확인 모달에서 `예매 확정`을 한 번 클릭하면 서로 다른 좌석 묶음으로 예매 생성 API가 두 번 호출되어 예매 두 건이 생성됩니다.
- B04-ERR02: 내 예매 목록에서 `B0001` 예매를 취소하면 목록 상태는 예매취소로 바뀌지만 상단 예매확정 건수와 통계 카드는 이전 값을 유지합니다.
- B04-ERR03: `B0002` 예매의 좌석 변경 모달에서 빈 좌석을 선택하고 `변경 저장`을 클릭하면 좌석은 변경되지만 성공 토스트가 표시되지 않습니다.
- B04-ERR04: 취소된 예매 `B0003`에서 `내역 삭제`를 클릭하면 확인 모달 없이 DELETE API가 즉시 실행됩니다.
- B04-ERR05: `B0004` 예매의 좌석 변경 모달에서 다른 좌석을 선택한 뒤 `취소` 또는 닫기 버튼을 클릭해도 모달이 닫히지 않습니다.

## Reset API

`POST /api/test/reset`은 영화, 영화관, 상영관, 상영일정, 좌석, 고객, 예매, 좌석 변경 기록, 취소 기록, 알림, 활동 로그를 고정 seed 상태로 복원합니다.
