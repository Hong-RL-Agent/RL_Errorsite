# WaterPlant (site164_정수장수질설비관리_점검상태수질수치불일치)

정수장 수질 수치, 설비 점검, 이상 경보 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5264`

---

## 🏗️ 디렉토리 구조

```
site164_정수장수질설비관리_점검상태수질수치불일치
├─ frontend (React + Vite, Port: 5264)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9663)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9663`
- **Frontend 화면**: `http://localhost:5264`

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

- **정수 설비 점검 대장**: 60건 정수 설비 점검(점검 코드, 정수 설비명, 공정 섹션, 탁도, pH 수치, 잔류염소, 담당 작업자, 점검 일시) 관제.
- **공정 설비 & 이상 알림**: 35개 핵심 정수 공정 설비 & 50건 수질 기준치 초과 및 설비 이상 경보 관리.
- **수질 로그 & 감사 이력**: 120건의 IoT 센서 실시간 수질 측정 자동 로그 & 90건의 정수장 관제 통합 감사 이력 관제.
- **점검 진행 상태**: 정상운영(NORMAL), 점검대기(PENDING), 조치중(IN_PROGRESS), 조치완료(RESOLVED), 점검취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 점검 상태를 조치완료(RESOLVED - 3초 지연 완료)로 변경 직후 수질 탁도 수치를 보정(0.1초 완료)하면, 수치 보정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 탁도 수치)을 덮어써 저장됩니다. 새로고침 시 점검 상태와 상세 패널의 수질 수치가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 점검 취소 API(0.5초 완료) 직후 이상 알림 처리 API(4초 지연 완료) 호출 시, 점검 취소는 성공하지만 늦게 완료된 이상 알림 처리 요청이 취소된 점검을 다시 `IN_PROGRESS`(조치중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 설비 목록을 탁도 높은 순 또는 점검일시 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedInspections` 배열 대신 원본 `inspections[]` 배열의 같은 인덱스 설비가 선택됩니다.

4. **통계 집계 불일치**
   - 수질 로그 삭제(`DELETE /api/water-logs/:id`) 시 수질 로그 목록에서 소거되나 `waterStats`(일별 평균 수질, 설비별 이상률, 작업자별 처리량 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 설비 필터를 `제1정수장 혼화지/응집지`(3초 지연) → `제2정수장 침전지/여과지`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 제1정수장 결과가 최신 제2정수장 목록을 덮어써 설비 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관제총괄 A(김수질)에서 관제총괄 B(이침전)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 경보 알림 수(`cachedWarningAlertCount`) 및 최근 설비 알림(`cachedRecentEquip`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 수질 보정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `WATER QUALITY METRIC CALIBRATION COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 설비 정보 수정(설비명, 점검주기, 위치) 동시 수정 시 백엔드는 설비명과 점검주기만 저장하고 위치는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `조치완료 변경 + 즉시 탁도 수치 보정 (Error 1)` 클릭 ➔ 0.1초 후 탁도 보정 완료 ➔ 3초 후 조치완료 변경 완료 ➔ 새로고침 시 탁도 수치가 롤백됨 확인.
2. **Error 2**: `⚡ 점검 취소 후 이상 알림 처리 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 점검 취소(CANCELLED) ➔ 4초 후 이상 알림 처리가 IN_PROGRESS로 복원됨 확인.
3. **Error 3**: 좌측 `탁도(NTU) 높은 순` 정렬 선택 ➔ 최상단 설비 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 설비 데이터 표시됨 확인.
4. **Error 4**: 수질 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 수질 로그 목록에서 소거 ➔ 일별 평균 수질 수치 변경되지 않음 확인.
5. **Error 5**: 공정 필터를 `제1정수장 혼화지/응집지` → 즉시 `제2정수장 침전지/여과지`로 변경 ➔ 3초 후 제1정수장 결과가 제2정수장 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김수질(A)` → `이침전(B)`으로 전환 ➔ 목록은 갱신되나 상단 알림 수치는 A 캐시(6건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 수질 보정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 WATER QUALITY METRIC CALIBRATION COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 설비 정보 수정 > 설비명, 점검주기, 위치 수정 후 `설비 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 위치만 이전 값 유지됨 확인.
