# BuildSafe (site114_건설현장안전장비관리_점검상태장비배정불일치)

건설현장 안전점검, 위험요소 조치, 안전장비 배정, 작업자 교육 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5214`

---

## 🏗️ 디렉토리 구조

```
site114_건설현장안전장비관리_점검상태장비배정불일치
├─ frontend (React + Vite, Port: 5214)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9613)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9613`
- **Frontend 화면**: `http://localhost:5214`

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

- **안전 점검 대장**: 50건의 위험요소 점검 데이터(CRITICAL/HIGH/MEDIUM/LOW 등급), 담당 장비, 조치 마감일 관리.
- **현장 구역 배치도**: 15개 건설 구역(A동, B동, 지하층, 자재구역 등)별 위험도 및 작업자 분포 시각화.
- **안전 장비 목록**: 35대의 중장비/안전감지장비(타워크레인, 리프트, 밀폐가스 측정기 등) 점검 주기 관리.
- **안전교육 & 활동 이력**: 60건의 작업자 안전교육 수료 현황 및 90건의 감사 로그 관리.
- **작업자 45명** 안전 점수 및 조치 이력 관리.

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 안전 점검 상태를 조치완료(COMPLETED - 3초 지연 완료)로 변경 직후 담당 장비를 변경(0.1초 완료)하면, 장비 변경 API는 먼저 완료되나 3초 뒤 완료되는 점검 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 장비)을 덮어써 저장됩니다. 새로고침 시 점검 목록의 장비와 점검 상세의 장비가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 위험요소 신고 취소 API(0.5초 완료) 직후 장비 점검 완료 API(4초 지연 완료) 호출 시, 신고 취소는 성공하지만 늦게 완료된 장비 점검 요청이 취소된 위험요소를 다시 `IN_PROGRESS`(조치중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 점검 목록을 위험도순/마감일순으로 정렬 후 상세 버튼 클릭 시 `sortedInspections` 배열 대신 원본 `inspections[]` 배열의 같은 인덱스 점검 상세가 열립니다.

4. **통계 집계 불일치**
   - 안전교육 기록 삭제(`DELETE /api/trainings/:id`) 시 교육 목록에서 소거되나 `safetyStats`(작업자별 교육 이수율, 현장별 위험도 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 현장 구역 필터를 `A동`(3초 지연) → `B동`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 A동 결과가 최신 B동 점검 목록을 덮어써 점검 목록과 오른쪽 위험도 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 안전관리자 A(김안전)에서 안전관리자 B(이현장)로 전환 시 점검 목록은 B 담당 기준으로 갱신되나, 상단 미조치 위험요소 수(`cachedPendingHazards`) 및 최근 점검 상세 알림(`cachedRecentInspection`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 작업자가 위험요소 조치완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `HAZARD RESOLVED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 장비 정보 수정(장비명, 점검주기, 배정 구역) 동시 수정 시 백엔드는 장비명과 배정 구역만 저장하고 점검주기는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `조치완료 처리 + 즉시 장비 변경 (Error 1)` 클릭 ➔ 0.1초 후 장비 변경 완료 ➔ 3초 후 조치완료 완료 ➔ 새로고침 시 장비가 롤백됨 확인.
2. **Error 2**: `⚡ 위험요소 신고 취소 후 장비점검 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 신고 취소(CANCELLED) ➔ 4초 후 장비점검 완결이 IN_PROGRESS로 복원됨 확인.
3. **Error 3**: 좌측 `위험도 높은순` 정렬 선택 ➔ 최상단 점검 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 점검 데이터 표시됨 확인.
4. **Error 4**: 안전교육 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 교육 목록에서 소거 ➔ 대시보드 이수율 수치 변경되지 않음 확인.
5. **Error 5**: 현장 구역 필터를 `A동` → 즉시 `B동`으로 변경 ➔ 3초 후 A동 결과가 B동 목록을 덮어씀 확인.
6. **Error 6**: 상단 관리자를 `김안전(A)` → `이현장(B)`으로 전환 ➔ 점검 목록은 갱신되나 상단 미조치 위험요소 수치는 A 캐시(18건) 잔존 확인.
7. **Error 7**: 안전교육 탭 > `🔒 권한 없는 작업자의 위험요소 강제 조치완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 HAZARD RESOLVED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 장비 정보 수정 > 장비명, 점검주기, 배정 구역 수정 후 `장비 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 점검주기만 이전 값 유지됨 확인.
