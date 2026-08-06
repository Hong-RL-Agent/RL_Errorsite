# WashBay (site131_세차장예약패키지관리_예약상태패키지옵션불일치)

세차장 예약, 세차 패키지, 차량 케어 입출고 베이 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5231`

---

## 🏗️ 디렉토리 구조

```
site131_세차장예약패키지관리_예약상태패키지옵션불일치
├─ frontend (React + Vite, Port: 5231)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9630)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9630`
- **Frontend 화면**: `http://localhost:5231`

### 실행 방법 (서로 다른 터미널에서 실행)

**백엔드 실행 (터미널 1):**
```bash
cd backend
npm install
npm start
```

**프론트엔드 실행 (터미널 2):**
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 정상 기능 요약

- **세차 예약 대장**: 50건의 세차 예약(예약번호, 입고 지점명, 차량번호, 차종, 고객명, 패키지, 추가 옵션, 결제 금액, 시간) 관제.
- **지점 베이 & 패키지**: 10개 디테일링 지점 베이 현황 & 15개 세차 패키지 카탈로그 관리.
- **차량 & 작업 로그**: 45대 등록 차량, 80건의 실시간 입고 세차 작업 로그 & 90건의 감사 이력 관제.
- **예약 상태**: 예약대기(PENDING), 작업중(IN_PROGRESS), 작업완료(COMPLETED), 취소됨(CANCELLED), 환불됨(REFUNDED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 예약 상태를 작업중(IN_PROGRESS - 3초 지연 완료)으로 변경 직후 패키지 옵션을 변경(0.1초 완료)하면, 패키지 옵션 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 패키지 옵션)을 덮어써 저장됩니다. 새로고침 시 예약 작업상태와 상세 패널의 패키지 옵션이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 예약 취소 API(0.5초 완료) 직후 작업 완료 API(4초 지연 완료) 호출 시, 예약 취소는 성공하지만 늦게 완료된 작업 완료 요청이 취소된 예약을 다시 `COMPLETED`(작업완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 예약 목록을 결제 금액순 또는 예약 시간순으로 정렬 후 상세 버튼 클릭 시 `sortedBookings` 배열 대신 원본 `bookings[]` 배열의 같은 인덱스 예약이 선택됩니다.

4. **통계 집계 불일치**
   - 작업 로그 삭제(`DELETE /api/work-logs/:id`) 시 작업 로그 목록에서 소거되나 `washStats`(지점별 매출, 패키지별 선택률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 지점 필터를 `강남 본점`(3초 지연) → `서초 직영점`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 강남 본점 결과가 최신 서초 지점 예약 목록을 덮어써 예약 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김세차)에서 직원 B(이디테일)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 오늘 예약 수(`cachedTodayCount`) 및 최근 예약 알림(`cachedRecentBooking`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 예약 환불 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `BOOKING REFUNDED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 차량 정보 수정(차량번호, 차종, 고객 연락처) 동시 수정 시 백엔드는 차량번호와 고객 연락처만 저장하고 차종은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `작업중 변경 + 즉시 패키지 옵션 변경 (Error 1)` 클릭 ➔ 0.1초 후 패키지 옵션 변경 완료 ➔ 3초 후 작업중 변경 완료 ➔ 새로고침 시 패키지 옵션이 롤백됨 확인.
2. **Error 2**: `⚡ 예약 취소 후 작업 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 예약 취소(CANCELLED) ➔ 4초 후 작업 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `결제 금액 높은순` 정렬 선택 ➔ 최상단 예약 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 예약 데이터 표시됨 확인.
4. **Error 4**: 작업 이력 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 작업 로그 목록에서 소거 ➔ 지점별 매출 수치 변경되지 않음 확인.
5. **Error 5**: 지점 필터를 `강남 본점` → 즉시 `서초 직영점`으로 변경 ➔ 3초 후 강남 결과가 서초 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김세차(A)` → `이디테일(B)`으로 전환 ➔ 목록은 갱신되나 상단 오늘 예약 수치는 A 캐시(18건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 예약 환불 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 BOOKING REFUNDED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 차량 정보 수정 > 차량번호, 차종, 고객 연락처 수정 후 `차량 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 차종만 이전 값 유지됨 확인.
