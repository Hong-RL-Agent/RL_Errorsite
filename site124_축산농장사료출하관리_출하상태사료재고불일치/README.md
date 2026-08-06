# FarmHerd (site124_축산농장사료출하관리_출하상태사료재고불일치)

스마트 축산 농장 개체 관리, 사료 재고, 출하 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5224`

---

## 🏗️ 디렉토리 구조

```
site124_축산농장사료출하관리_출하상태사료재고불일치
├─ frontend (React + Vite, Port: 5224)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9623)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9623`
- **Frontend 화면**: `http://localhost:5224`

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

- **가축 개체 대장**: 80두 스마트 축산 개체(귀표번호, 품종, 월령, 체중, 건강상태) 관제.
- **축사 배치도 & 사료 재고**: 12개동 축사 배치도 & 35개 사료 재고 잔량 관리.
- **출하 & 급여 이력**: 45건의 축산물 출하 일정, 90건의 일일 사료 급여 로그 & 90건의 감사 이력 관리.
- **출하 상태**: 입식사육중(RAISING), 출하대기(SHIPMENT_PENDING), 출하확정(SHIPMENT_CONFIRMED), 출하완료(SHIPPED), 취소/보류(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 출하 상태를 출하확정(SHIPMENT_CONFIRMED - 3초 지연 완료)으로 변경 직후 사료 재고를 차감(0.1초 완료)하면, 사료 차감 API는 먼저 완료되나 3초 뒤 완료되는 출하 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 사료 재고)을 덮어써 저장됩니다. 새로고침 시 개체 목록의 사료 재고와 상세 패널의 사료 재고가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 출하 취소 API(0.5초 완료) 직후 건강 기록 등록 API(4초 지연 완료) 호출 시, 출하 취소는 성공하지만 늦게 완료된 건강 기록 등록 요청이 취소된 출하를 다시 `SHIPMENT_PENDING`(출하대기) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 개체 목록을 체중순으로 정렬 후 상세 버튼 클릭 시 `sortedLivestocks` 배열 대신 원본 `livestocks[]` 배열의 같은 인덱스 개체가 선택됩니다.

4. **통계 집계 불일치**
   - 급여 로그 삭제(`DELETE /api/feed-logs/:id`) 시 급여 로그 목록에서 소거되나 `farmStats`(사료 사용량, 개체 성장률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 축사 필터를 `BARN-01 제1축사`(3초 지연) → `BARN-02 제2축사`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 BARN-01 결과가 최신 BARN-02 개체 목록을 덮어써 개체 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김축산)에서 관리자 B(이사료)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 출하 대기 수(`cachedShipmentPendingCount`) 및 최근 개체 알림(`cachedRecentLivestock`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 출하 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `SHIPMENT CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 개체 정보 수정(체중, 건강상태, 축사위치) 동시 수정 시 백엔드는 체중과 축사위치만 저장하고 건강상태는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `출하확정 변경 + 즉시 사료 차감 (Error 1)` 클릭 ➔ 0.1초 후 사료 차감 완료 ➔ 3초 후 출하확정 변경 완료 ➔ 새로고침 시 사료 재고가 롤백됨 확인.
2. **Error 2**: `⚡ 출하 취소 후 건강 기록 등록 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 출하 취소(CANCELLED) ➔ 4초 후 건강 기록 등록이 SHIPMENT_PENDING으로 복원됨 확인.
3. **Error 3**: 좌측 `체중 무거운순` 정렬 선택 ➔ 최상단 개체 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 개체 데이터 표시됨 확인.
4. **Error 4**: 급여 이력 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 급여 로그 목록에서 소거 ➔ 사료 사용량 수치 변경되지 않음 확인.
5. **Error 5**: 축사 필터를 `BARN-01` → 즉시 `BARN-02`로 변경 ➔ 3초 후 BARN-01 결과가 BARN-02 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김축산(A)` → `이사료(B)`으로 전환 ➔ 목록은 갱신되나 상단 출하대기 수치는 A 캐시(20두) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 출하 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 SHIPMENT CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 개체 정보 수정 > 체중, 건강상태, 축사위치 수정 후 `개체 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 건강상태만 이전 값 유지됨 확인.
