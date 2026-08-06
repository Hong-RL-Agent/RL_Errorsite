# SnowFleet (site157_도시제설작업차량관리_작업상태차량위치불일치)

도시 제설 구역, 제설차량 GPS 배치, 염화칼슘 자제 및 작업 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5257`

---

## 🏗️ 디렉토리 구조

```
site157_도시제설작업차량관리_작업상태차량위치불일치
├─ frontend (React + Vite, Port: 5257)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9656)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9656`
- **Frontend 화면**: `http://localhost:5257`

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

- **도시 제설 작업 대장**: 60건의 도시 제설 작업(작업 코드, 구역명, 투입 차량번호, 담당 운전원, GPS 위치, 투입 염화칼슘량, 우선순위) 관제.
- **제설 구역 & 차량 장비**: 30개 제설 구역 & 35대 특수 살포 차량 및 40명 운전원 명단 관리.
- **제설 로그 & 감사 이력**: 90건의 현장 운행 및 살포 실시간 로그 & 90건의 재난안전 통합 감사 이력 관제.
- **작업 진행 상태**: 대기중(PENDING), 진행중(IN_PROGRESS), 염포작업(SALTING), 작업완료(COMPLETED), 작업취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 작업 상태를 진행중(IN_PROGRESS - 3초 지연 완료)으로 변경 직후 차량 위치를 수정(0.1초 완료)하면, 위치 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 차량 위치)을 덮어써 저장됩니다. 새로고침 시 작업 상태와 상세 패널의 차량 위치가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 작업 취소 API(0.5초 완료) 직후 염화칼슘 사용량 등록 API(4초 지연 완료) 호출 시, 작업 취소는 성공하지만 늦게 완료된 사용량 등록 요청이 취소된 작업을 다시 `COMPLETED`(작업완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 작업 목록을 긴급도 최우선 순 또는 시작시간 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedTasks` 배열 대신 원본 `tasks[]` 배열의 같은 인덱스 작업이 선택됩니다.

4. **통계 집계 불일치**
   - 제설 로그 삭제(`DELETE /api/snow-logs/:id`) 시 제설 로그 목록에서 소거되나 `snowStats`(구역별 작업률, 차량별 운행거리, 염화칼슘 사용량 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 구역 필터를 `강남1구역`(3초 지연) → `강북2구역`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 강남1구역 결과가 최신 강북2구역 목록을 덮어써 작업 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김제설)에서 관리자 B(이방설)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 긴급작업 수(`cachedDelayedTaskCount`) 및 최근 작업 알림(`cachedRecentTask`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 작업 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `CITY SNOW REMOVAL TASK COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 차량 정보 수정(차량번호, 장비상태, 담당구역) 동시 수정 시 백엔드는 차량번호와 장비상태만 저장하고 담당구역은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `진행중 변경 + 즉시 차량 위치 수정 (Error 1)` 클릭 ➔ 0.1초 후 차량 위치 수정 완료 ➔ 3초 후 진행중 변경 완료 ➔ 새로고침 시 차량 위치가 롤백됨 확인.
2. **Error 2**: `⚡ 작업 취소 후 염화칼슘 사용량 등록 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 작업 취소(CANCELLED) ➔ 4초 후 사용량 등록이 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `긴급도 최우선 순` 정렬 선택 ➔ 최상단 작업 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 작업 데이터 표시됨 확인.
4. **Error 4**: 제설 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 제설 로그 목록에서 소거 ➔ 구역별 작업률 수치 변경되지 않음 확인.
5. **Error 5**: 구역 필터를 `강남권역 제설1구역 (테헤란로/강남대로)` → 즉시 `강북권역 제설2구역 (남산소파로/소월로)`으로 변경 ➔ 3초 후 강남1구역 결과가 강북2구역 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김제설(A)` → `이방설(B)`으로 전환 ➔ 목록은 갱신되나 상단 긴급작업 수치는 A 캐시(7건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 제설 작업 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 CITY SNOW REMOVAL TASK COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 차량 정보 수정 > 차량번호, 장비상태, 담당구역 수정 후 `차량 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 담당구역만 이전 값 유지됨 확인.
