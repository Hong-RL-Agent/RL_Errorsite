# ParkControl (site137_공영주차장운영관리_주차면상태정산정보불일치)

공영주차장 주차면 실시간 유도, LPR 차량 입출차, 무인 정산 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5237`

---

## 🏗️ 디렉토리 구조

```
site137_공영주차장운영관리_주차면상태정산정보불일치
├─ frontend (React + Vite, Port: 5237)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9636)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9636`
- **Frontend 화면**: `http://localhost:5237`

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

- **주차장 & 주차면 유도 배치도**: 8개 공영주차장 & 120개 주차면(일반형, 경차전용, 전기차 충전면) 실시간 현황 관제.
- **차량 입출차 & 요금 산정**: 80건의 입출차 기록(차량번호, 차종, 입차시각, 출차시각, 주차시간, 정산요금) 관리.
- **무인 정산 & 할인 내역**: 60건의 무인 정산 및 경차/전기차 감면 혜택 내역 & 90건의 통합 관제 감사 이력.
- **주차/정산 상태**: 빈주차면(VACANT), 주차중(OCCUPIED), 출차완료(EXITED), 정산완료(SETTLED), 미납(UNPAID), 출차취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 주차면 상태를 사용중(OCCUPIED - 3초 지연 완료)으로 변경 직후 정산 금액을 수정(0.1초 완료)하면, 금액 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 정산 금액)을 덮어써 저장됩니다. 새로고침 시 주차면 상태와 상세 패널의 정산 금액이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 출차 취소 API(0.5초 완료) 직후 정산 완료 API(4초 지연 완료) 호출 시, 출차 취소는 성공하지만 늦게 완료된 정산 완료 요청이 취소된 출차를 다시 `SETTLED`(정산완료) 상태로 복원합니다. 입출차 목록에서는 취소(CANCELLED), 정산 내역에서는 완료(SETTLED)로 불일치합니다.

3. **Frontend 정렬 인덱스 오류**
   - 차량 목록을 주차시간순 또는 정산 금액순으로 정렬 후 상세 버튼 클릭 시 `sortedRecords` 배열 대신 원본 `records[]` 배열의 같은 인덱스 차량이 선택됩니다.

4. **통계 집계 불일치**
   - 정산 로그 삭제(`DELETE /api/settlements/:id`) 시 정산 로그 목록에서 소거되나 `parkStats`(주차장별 매출, 회전율, 미납 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 주차장 필터를 `강남역 노외`(3초 지연) → `서초중앙 공영`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 강남역 결과가 최신 서초중앙 차량 목록을 덮어써 차량 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관제 관리자 A(김주차)에서 관제 관리자 B(이정산)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 미납 수(`cachedUnpaidCount`) 및 최근 차량 알림(`cachedRecentRecord`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 정산 취소 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `SETTLEMENT CANCELLED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 차량 정보 수정(차량번호, 차종, 연락처) 동시 수정 시 백엔드는 차량번호와 연락처만 저장하고 차종은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `사용중 변경 + 즉시 요금 수정 (Error 1)` 클릭 ➔ 0.1초 후 요금 수정 완료 ➔ 3초 후 사용중 변경 완료 ➔ 새로고침 시 요금이 롤백됨 확인.
2. **Error 2**: `⚡ 출차 취소 후 정산 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 출차 취소(CANCELLED) ➔ 4초 후 정산 완료가 SETTLED로 복원됨 확인.
3. **Error 3**: 좌측 `주차 시간 긴 순` 정렬 선택 ➔ 최상단 차량 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 차량 데이터 표시됨 확인.
4. **Error 4**: 정산 내역 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 정산 로그 목록에서 소거 ➔ 주차장별 매출 수치 변경되지 않음 확인.
5. **Error 5**: 주차장 필터를 `강남역 노외` → 즉시 `서초중앙 공영`으로 변경 ➔ 3초 후 강남역 결과가 서초중앙 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김주차(A)` → `이정산(B)`으로 전환 ➔ 목록은 갱신되나 상단 미납 건 수치는 A 캐시(14건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 정산 취소 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 SETTLEMENT CANCELLED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 차량 정보 수정 > 차량번호, 차종, 연락처 수정 후 `차량 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 차종만 이전 값 유지됨 확인.
