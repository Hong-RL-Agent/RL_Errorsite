# TrailSafe (site141_등산로안전신고관리_신고상태위치정보불일치)

국립공원 등산로 안전 신고, 위험 구간 관리, 산악 구조대 배정 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5241`

---

## 🏗️ 디렉토리 구조

```
site141_등산로안전신고관리_신고상태위치정보불일치
├─ frontend (React + Vite, Port: 5241)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9640)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9640`
- **Frontend 화면**: `http://localhost:5241`

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

- **등산로 위험 신고 대장**: 55건의 탐방객 안전 신고(신고 코드, 국립공원 구역, 등산로 구간, 위험 유형, 위치설명, 위험등급, 담당 순찰팀) 관제.
- **위험 구간 & 산악 구조대**: 30개 국립공원 등산로 위험 구간 & 15개 권역별 산악 구조 순찰대 관리.
- **현장 조치 & 감사 로그**: 70건의 위험 현장 안전 통제 및 완료 로그 & 90건의 산림 안전관제 통합 감사 이력 관제.
- **신고 처리 진행 상태**: 신고접수(PENDING), 현장확인(INSPECTING), 조치중(IN_ACTION), 조치완료(RESOLVED), 위험구역해제(CLEARED), 신고취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 신고 상태를 조치중(IN_ACTION - 3초 지연 완료)으로 변경 직후 위험 위치를 수정(0.1초 완료)하면, 위치 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 위험 위치)을 덮어써 저장됩니다. 새로고침 시 신고 상태와 상세 패널의 위험 위치가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 신고 취소 API(0.5초 완료) 직후 조치 완료 API(4초 지연 완료) 호출 시, 신고 취소는 성공하지만 늦게 완료된 조치 완료 요청이 취소된 신고를 다시 `RESOLVED`(조치완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 신고 목록을 위험 등급 긴급순 또는 신고 시각 최신순으로 정렬 후 상세 버튼 클릭 시 `sortedReports` 배열 대신 원본 `reports[]` 배열의 같은 인덱스 신고가 선택됩니다.

4. **통계 집계 불일치**
   - 조치 로그 삭제(`DELETE /api/action-logs/:id`) 시 조치 로그 목록에서 소거되나 `trailStats`(구역별 신고 수, 위험도 점수, 순찰팀별 처리량 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 국립공원 필터를 `북한산 국립공원`(3초 지연) → `설악산 국립공원`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 북한산 결과가 최신 설악산 신고 목록을 덮어써 신고 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 담당자 A(김산림)에서 담당자 B(이순찰)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 미조치 수(`cachedPendingCount`) 및 최근 위험 신고 알림(`cachedRecentReport`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 위험구역 해제 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `DANGER ZONE CLEARED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 신고 정보 수정(신고유형, 위치설명, 위험등급) 동시 수정 시 백엔드는 신고유형과 위험등급만 저장하고 위치설명은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `조치중 변경 + 즉시 위치 수정 (Error 1)` 클릭 ➔ 0.1초 후 위치 수정 완료 ➔ 3초 후 조치중 변경 완료 ➔ 새로고침 시 위험 위치가 롤백됨 확인.
2. **Error 2**: `⚡ 신고 취소 후 조치 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 신고 취소(CANCELLED) ➔ 4초 후 조치 완료가 RESOLVED로 복원됨 확인.
3. **Error 3**: 좌측 `위험 등급 긴급순` 정렬 선택 ➔ 최상단 신고 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 신고 데이터 표시됨 확인.
4. **Error 4**: 현장 조치 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 조치 로그 목록에서 소거 ➔ 구역별 위험도 점수 수치 변경되지 않음 확인.
5. **Error 5**: 국립공원 필터를 `북한산 국립공원` → 즉시 `설악산 국립공원`으로 변경 ➔ 3초 후 북한산 결과가 설악산 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김산림(A)` → `이순찰(B)`으로 전환 ➔ 목록은 갱신되나 상단 미조치 수치는 A 캐시(14건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 위험구역 해제 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 DANGER ZONE CLEARED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 신고 정보 수정 > 신고유형, 위치설명, 위험등급 수정 후 `신고 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 위치설명만 이전 값 유지됨 확인.
