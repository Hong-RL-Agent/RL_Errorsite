# PlantSub (site151_원예화분구독관리_배송상태식물상태불일치)

원예 화분 정기 구독 배송, 식물 건강도 진단, 화분 교체 신청 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5251`

---

## 🏗️ 디렉토리 구조

```
site151_원예화분구독관리_배송상태식물상태불일치
├─ frontend (React + Vite, Port: 5251)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9650)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9650`
- **Frontend 화면**: `http://localhost:5251`

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

- **원예 화분 구독 대장**: 50명의 화분 정기 구독 고객(구독 코드, 구독자 성명, 구독 화분 식물명, 식물 유형, 배송지 주소, 식물 건강 상태, 배송일) 관제.
- **등록 식물 & 정기 배송**: 60개 생육 식물 품종 & 55건의 정기 배송 및 35건의 화분 교체 신청서 관리.
- **건강도 로그 & 감사 이력**: 90건의 식물 건강도 진단 및 잎 활력 상태 로그 & 90건의 원예 관제 통합 감사 이력 관제.
- **배송 진행 상태**: 배송준비(PREPARING), 배송중(DELIVERING), 배송완료(DELIVERED), 교체진행(REPLACING), 구독취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 배송 상태를 배송완료(DELIVERED - 3초 지연 완료)로 변경 직후 식물 건강 상태를 수정(0.1초 완료)하면, 건강 상태 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 건강 상태)을 덮어써 저장됩니다. 새로고침 시 배송 상태와 상세 패널의 건강 상태가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 구독 취소 API(0.5초 완료) 직후 교체 신청 승인 API(4초 지연 완료) 호출 시, 구독 취소는 성공하지만 늦게 완료된 교체 신청 승인 요청이 취소된 구독을 다시 `REPLACING`(교체진행) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 고객 목록을 건강도 우수 순 또는 배송 일자 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedSubscribers` 배열 대신 원본 `subscribers[]` 배열의 같은 인덱스 고객이 선택됩니다.

4. **통계 집계 불일치**
   - 식물 상태 로그 삭제(`DELETE /api/health-logs/:id`) 시 식물 상태 로그 목록에서 소거되나 `plantStats`(식물별 건강도, 고객별 교체율, 월별 배송 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 식물 유형 필터를 `관엽식물 몬스테라`(3초 지연) → `다육식물 & 공기정화`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 몬스테라 결과가 최신 다육식물 목록을 덮어써 고객 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김식물)에서 관리자 B(이화분)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 교체대기 수(`cachedReplacementPendingCount`) 및 최근 식물 알림(`cachedRecentSubscriber`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 교체 승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `PLANT REPLACEMENT APPROVED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 식물 정보 수정(식물명, 햇빛등급, 물주기) 동시 수정 시 백엔드는 식물명과 햇빛등급만 저장하고 물주기는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `배송완료 변경 + 즉시 건강 상태 수정 (Error 1)` 클릭 ➔ 0.1초 후 건강 상태 수정 완료 ➔ 3초 후 배송완료 변경 완료 ➔ 새로고침 시 건강 상태가 롤백됨 확인.
2. **Error 2**: `⚡ 구독 취소 후 화분 교체 승인 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 구독 취소(CANCELLED) ➔ 4초 후 교체 승인이 REPLACING으로 복원됨 확인.
3. **Error 3**: 좌측 `건강도 우수 순` 정렬 선택 ➔ 최상단 고객 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 고객 데이터 표시됨 확인.
4. **Error 4**: 건강도 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 식물 상태 로그 목록에서 소거 ➔ 식물별 건강도 수치 변경되지 않음 확인.
5. **Error 5**: 식물 유형 필터를 `관엽식물 몬스테라` → 즉시 `다육식물 & 공기정화`로 변경 ➔ 3초 후 몬스테라 결과가 다육식물 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김식물(A)` → `이화분(B)`으로 전환 ➔ 목록은 갱신되나 상단 교체대기 수치는 A 캐시(7건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 화분 교체 승인 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 PLANT REPLACEMENT APPROVED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 식물 정보 수정 > 식물명, 햇빛등급, 물주기 수정 후 `식물 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 물주기만 이전 값 유지됨 확인.
