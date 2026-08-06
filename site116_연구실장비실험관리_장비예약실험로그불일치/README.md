# LabReserve (site116_연구실장비실험관리_장비예약실험로그불일치)

연구실 첨단 장비 예약, 실험 로그 작성, 장비 점검 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5216`

---

## 🏗️ 디렉토리 구조

```
site116_연구실장비실험관리_장비예약실험로그불일치
├─ frontend (React + Vite, Port: 5216)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9615)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9615`
- **Frontend 화면**: `http://localhost:5216`

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

- **연구 장비 대장**: 35개 첨단 분석/측정/광학/반도체/바이오 장비(사용률, 위치, 점검주기) 관제.
- **장비 상태 관리**: 사용가능(AVAILABLE), 예약중(RESERVED), 사용중(IN_USE), 점검중(MAINTENANCE), 고장(BROKEN), 사용중지(DISABLED).
- **장비 예약 캘린더**: 50건의 연구원별 장비 사용 예약 타임라인 관제.
- **실험 및 감사 로그**: 70건의 실험 기록 로그, 35건의 점검 요청, 90건의 감사 활동 로그 관리.
- **연구원 30명** 소속 연구실 및 완료 실험 건수 관리.

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 장비 예약 시간을 변경(3초 지연 완료) 직후 실험 로그를 작성(0.1초 완료)하면, 실험 로그 작성 API는 먼저 완료되나 3초 뒤 완료되는 예약 시간 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 예약 시간)을 덮어써 저장됩니다. 새로고침 시 예약 캘린더의 시간과 실험 로그의 시간이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 예약 취소 API(0.5초 완료) 직후 장비 사용완료 API(4초 지연 완료) 호출 시, 예약 취소는 성공하지만 늦게 완료된 사용완료 요청이 취소된 예약을 다시 `COMPLETED`(사용완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 장비 목록을 사용률순/점검필요순으로 정렬 후 예약 버튼 클릭 시 `sortedEquipments` 배열 대신 원본 `equipments[]` 배열의 같은 인덱스 장비가 예약됩니다.

4. **통계 집계 불일치**
   - 실험 로그 삭제(`DELETE /api/exp-logs/:id`) 시 로그 목록에서 소거되나 `labStats`(장비별 사용률, 연구원별 사용시간 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 장비 유형 필터를 `분석장비`(3초 지연) → `측정장비`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 분석장비 결과가 최신 측정장비 목록을 덮어써 장비 목록과 오른쪽 예약 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 연구원 A(김연구)에서 연구원 B(이실험)로 전환 시 예약 목록은 B 기준 기준으로 갱신되나, 상단 내 예약 수(`cachedMyReservations`) 및 최근 실험 알림(`cachedRecentExpLog`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 연구원이 장비 사용중지 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `EQUIPMENT DISABLED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 장비 정보 수정(장비명, 위치, 점검주기) 동시 수정 시 백엔드는 장비명과 점검주기만 저장하고 위치는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `예약 시간 변경 + 즉시 실험로그 작성 (Error 1)` 클릭 ➔ 0.1초 후 실험로그 작성 완료 ➔ 3초 후 예약 시간 변경 완료 ➔ 새로고침 시 실험로그 작성이 롤백됨 확인.
2. **Error 2**: `⚡ 예약 취소 후 장비 사용완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 예약 취소(CANCELLED) ➔ 4초 후 장비 사용완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `사용률 높은순` 정렬 선택 ➔ 최상단 장비 `예약 (E3)` 클릭 ➔ 우측 패널에 다른 장비 데이터 표시됨 확인.
4. **Error 4**: 실험 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 실험 로그 목록에서 소거 ➔ 장비 사용률 수치 변경되지 않음 확인.
5. **Error 5**: 장비 유형 필터를 `분석장비` → 즉시 `측정장비`로 변경 ➔ 3초 후 분석장비 결과가 측정장비 목록을 덮어씀 확인.
6. **Error 6**: 상단 연구원을 `김연구(A)` → `이실험(B)`으로 전환 ➔ 예약 목록은 갱신되나 상단 내 예약 수치는 A 캐시(3건) 잔존 확인.
7. **Error 7**: 점검 요청 탭 > `🔒 권한 없는 연구원의 장비 강제 사용중지 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 EQUIPMENT DISABLED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 장비 정보 수정 > 장비명, 위치, 점검주기 수정 후 `장비 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 위치만 이전 값 유지됨 확인.
