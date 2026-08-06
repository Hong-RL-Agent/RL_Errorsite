# StudioGear (site128_방송장비스튜디오관리_장비대여예약상태불일치)

방송 제작 장비 대여, 스튜디오 예약, 반납 점검 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5228`

---

## 🏗️ 디렉토리 구조

```
site128_방송장비스튜디오관리_장비대여예약상태불일치
├─ frontend (React + Vite, Port: 5228)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9627)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9627`
- **Frontend 화면**: `http://localhost:5228`

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

- **방송 장비 대장**: 50개 고급 방송 장비(카메라, 조명, 마이크, 짐벌 등 보관위치, 일일 대여료, 가동 사용률, 최근 점검일) 관제.
- **스튜디오 현황**: 12개 방송 제작 스튜디오 시설 및 시간당 이용료 관리.
- **예약 & 대여 로그**: 45건의 예약 타임라인, 60건의 대여 반납 점검 로그 & 90건의 활동 로그 관리.
- **장비 상태**: 예약대기(RESERVED), 대여중(RENTED), 사용완료(COMPLETED), 점검중(INSPECTING), 예약취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 장비 대여 상태를 대여중(RENTED - 3초 지연 완료)으로 변경 직후 스튜디오 예약 시간을 변경(0.1초 완료)하면, 예약 시간 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 예약 시간)을 덮어써 저장됩니다. 새로고침 시 장비/스튜디오 예약시간과 상세 패널의 예약시간이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 예약 취소 API(0.5초 완료) 직후 장비 반납 완료 API(4초 지연 완료) 호출 시, 예약 취소는 성공하지만 늦게 완료된 장비 반납 완료 요청이 취소된 예약을 다시 `COMPLETED`(사용완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 장비 목록을 가동 사용률순 또는 일일 대여료순으로 정렬 후 대여 버튼 클릭 시 `sortedGears` 배열 대신 원본 `gears[]` 배열의 같은 인덱스 장비가 선택됩니다.

4. **통계 집계 불일치**
   - 대여 로그 삭제(`DELETE /api/rental-logs/:id`) 시 대여 로그 목록에서 소거되나 `gearStats`(장비별 사용률, 스튜디오별 예약률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 장비 유형 필터를 `4K 시네마 카메라`(3초 지연) → `지미집/크레인`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 4K 카메라 결과가 최신 지미집 장비 목록을 덮어써 장비 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김스튜디오)에서 관리자 B(이장비)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 반납 대기 수(`cachedReturnPendingCount`) 및 최근 장비 알림(`cachedRecentGear`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 사용자가 장비 폐기 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `BROADCAST GEAR DISPOSED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 장비 정보 수정(장비명, 보관위치, 점검일) 동시 수정 시 백엔드는 장비명과 점검일만 저장하고 보관위치는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `대여중 변경 + 즉시 예약시간 변경 (Error 1)` 클릭 ➔ 0.1초 후 예약시간 변경 완료 ➔ 3초 후 대여중 변경 완료 ➔ 새로고침 시 예약 시간이 롤백됨 확인.
2. **Error 2**: `⚡ 예약 취소 후 장비 반납 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 예약 취소(CANCELLED) ➔ 4초 후 장비 반납 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `장비 가동 사용률 높음순` 정렬 선택 ➔ 최상단 장비 `대여 (E3)` 클릭 ➔ 우측 패널에 다른 장비 데이터 표시됨 확인.
4. **Error 4**: 대여 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 대여 로그 목록에서 소거 ➔ 장비별 사용률 수치 변경되지 않음 확인.
5. **Error 5**: 장비 유형 필터를 `4K 시네마 카메라` → 즉시 `지미집/크레인`으로 변경 ➔ 3초 후 4K 카메라 결과가 지미집 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김스튜디오(A)` → `이장비(B)`으로 전환 ➔ 목록은 갱신되나 상단 반납대기 수치는 A 캐시(16건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 장비 강제 폐기 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 BROADCAST GEAR DISPOSED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 장비 정보 수정 > 장비명, 보관위치, 점검일 수정 후 `장비 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 보관위치만 이전 값 유지됨 확인.
