# PostRoute (site127_우편물접수라우팅관리_배송경로상태불일치)

우편물 스마트 접수, 분류센터 라우팅, 배송 상태 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5227`

---

## 🏗️ 디렉토리 구조

```
site127_우편물접수라우팅관리_배송경로상태불일치
├─ frontend (React + Vite, Port: 5227)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9626)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9626`
- **Frontend 화면**: `http://localhost:5227`

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

- **우편물 대장**: 60건의 우편물(송장번호, 발송인, 수취인, 배송주소, 관할 HUB, 라우팅 경로) 관제.
- **분류센터 & 라우팅 경로**: 12개 분류센터 현황 & 40개 간선 수송 라우팅 표준 경로 관리.
- **배송 & 감사 이력**: 90건의 실시간 배송 및 라우팅 스캔 로그 & 90건의 감사 이력 관리.
- **우편 상태**: 접수(REGISTERED), 분류중(SORTING), 이동중(TRANSIT), 배달중(DELIVERING), 완료(COMPLETED), 반송(RETURNED), 보류(HOLD).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 배송 경로를 변경(3초 지연 완료)한 직후 배송 상태를 배달중(DELIVERING - 0.1초 완료)으로 변경하면, 상태 변경 API는 먼저 완료되나 3초 뒤 완료되는 경로 변경 API가 요청 시작 시점의 구 DB 스냅샷(배달중 상태와 이전 경로)을 덮어써 저장됩니다. 새로고침 시 우편물 목록의 경로와 상세 패널의 경로가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 반송 처리 API(0.5초 완료) 직후 배송 완료 API(4초 지연 완료) 호출 시, 반송 처리는 성공하지만 늦게 완료된 배송 완료 요청이 반송된 우편물을 다시 `COMPLETED`(완료) 상태로 복원합니다. 목록에서는 반송(RETURNED), 배송 로그에서는 완료(COMPLETED)로 보입니다.

3. **Frontend 정렬 인덱스 오류**
   - 우편물 목록을 접수 시간순 또는 거리순으로 정렬 후 상세 버튼 클릭 시 `sortedParcels` 배열 대신 원본 `parcels[]` 배열의 같은 인덱스 우편물이 선택됩니다.

4. **통계 집계 불일치**
   - 배송 로그 삭제(`DELETE /api/delivery-logs/:id`) 시 배송 로그 목록에서 소거되나 `postStats`(센터별 처리량, 반송률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 센터 필터를 `HUB-01 동서울`(3초 지연) → `HUB-02 서서울`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 HUB-01 결과가 최신 HUB-02 우편물 목록을 덮어써 우편물 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김우체)에서 직원 B(이물류)로 전환 시 목록은 B 담당 기준으로 갱신되나, 상단 보류 우편 수(`cachedHoldCount`) 및 최근 우편물 알림(`cachedRecentParcel`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 배송 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `PARCEL DELIVERY COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 수취인 정보 수정(이름, 연락처, 배송주소) 동시 수정 시 백엔드는 이름과 배송주소만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `경로 변경 + 즉시 배달중 변경 (Error 1)` 클릭 ➔ 0.1초 후 상태 변경 완료 ➔ 3초 후 경로 변경 완료 ➔ 새로고침 시 배송 상태가 롤백됨 확인.
2. **Error 2**: `⚡ 반송 처리 후 배송 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 반송 처리(RETURNED) ➔ 4초 후 배송 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `접수 시간 최근순` 정렬 선택 ➔ 최상단 우편물 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 우편물 데이터 표시됨 확인.
4. **Error 4**: 배송 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 배송 로그 목록에서 소거 ➔ 센터별 처리량 수치 변경되지 않음 확인.
5. **Error 5**: 센터 필터를 `HUB-01 동서울` → 즉시 `HUB-02 서서울`로 변경 ➔ 3초 후 동서울 결과가 서서울 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김우체(A)` → `이물류(B)`으로 전환 ➔ 목록은 갱신되나 상단 보류 우편 수치는 A 캐시(14건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 배송 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 PARCEL DELIVERY COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 수취인 정보 수정 > 이름, 연락처, 배송주소 수정 후 `수취인 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
