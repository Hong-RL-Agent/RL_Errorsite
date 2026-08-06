# HairStudioPro (site138_미용실디자이너시술관리_예약상태시술옵션불일치)

미용실 예약, 디자이너 일정, 시술 옵션 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5238`

---

## 🏗️ 디렉토리 구조

```
site138_미용실디자이너시술관리_예약상태시술옵션불일치
├─ frontend (React + Vite, Port: 5238)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9637)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9637`
- **Frontend 화면**: `http://localhost:5238`

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

- **시술 예약 대장**: 55건의 예약(예약 코드, 지점, 담당 디자이너, 고객 성함, 시술 옵션, 예약시각, 결제금액) 관제.
- **디자이너 & VIP 고객**: 15명 수석 디자이너 프로필 & 45명 VIP/로열티 고객 명단 관리.
- **방문 & 시술 결제 로그**: 80건의 실시간 시술 완료 방문 로그 & 90건의 살롱 운영 감사 이력 관제.
- **시술 진행 상태**: 예약확정(RESERVED), 시술중(IN_PROGRESS), 시술완료(COMPLETED), 취소(CANCELLED), 환불(REFUNDED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 예약 상태를 시술중(IN_PROGRESS - 3초 지연 완료)으로 변경 직후 시술 옵션을 변경(0.1초 완료)하면, 옵션 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 시술 옵션)을 덮어써 저장됩니다. 새로고침 시 예약 상태와 상세 패널의 시술 옵션이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 예약 취소 API(0.5초 완료) 직후 시술 완료 API(4초 지연 완료) 호출 시, 예약 취소는 성공하지만 늦게 완료된 시술 완료 요청이 취소된 예약을 다시 `COMPLETED`(시술완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 예약 목록을 금액순 또는 예약시각순으로 정렬 후 상세 버튼 클릭 시 `sortedReservations` 배열 대신 원본 `reservations[]` 배열의 같은 인덱스 예약이 선택됩니다.

4. **통계 집계 불일치**
   - 방문 로그 삭제(`DELETE /api/visit-logs/:id`) 시 방문 로그 목록에서 소거되나 `salonStats`(디자이너별 매출, 옵션별 선택률, 고객 재방문율 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 디자이너 필터를 `엘리 원장`(3초 지연) → `지아 디자이너`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 엘리 원장 결과가 최신 지아 디자이너 목록을 덮어써 예약 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 디자이너 A(엘리 원장)에서 디자이너 B(지아 디자이너)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 오늘 예약 수(`cachedTodayCount`) 및 최근 고객 알림(`cachedRecentClient`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 예약 환불 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `RESERVATION REFUNDED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 고객 정보 수정(이름, 연락처, 선호 디자이너) 동시 수정 시 백엔드는 이름과 선호 디자이너만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `시술중 변경 + 즉시 옵션 변경 (Error 1)` 클릭 ➔ 0.1초 후 옵션 변경 완료 ➔ 3초 후 시술중 변경 완료 ➔ 새로고침 시 시술 옵션이 롤백됨 확인.
2. **Error 2**: `⚡ 예약 취소 후 시술 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 예약 취소(CANCELLED) ➔ 4초 후 시술 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `시술 금액 높은 순` 정렬 선택 ➔ 최상단 예약 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 예약 데이터 표시됨 확인.
4. **Error 4**: 방문 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 방문 로그 목록에서 소거 ➔ 디자이너별 매출 수치 변경되지 않음 확인.
5. **Error 5**: 디자이너 필터를 `엘리 원장` → 즉시 `지아 디자이너`로 변경 ➔ 3초 후 엘리 원장 결과가 지아 디자이너 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `엘리(A)` → `지아(B)`로 전환 ➔ 목록은 갱신되나 상단 오늘 예약 수치는 A 캐시(14건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 예약 환불 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 RESERVATION REFUNDED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 고객 정보 수정 > 이름, 연락처, 선호 디자이너 수정 후 `고객 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
