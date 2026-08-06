# StreetLightOps (site149_가로등점검민원관리_점검상태위치정보불일치)

스마트 도시 가로등 고장 신고, 위치 지점 GPS, 점검 조치 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5249`

---

## 🏗️ 디렉토리 구조

```
site149_가로등점검민원관리_점검상태위치정보불일치
├─ frontend (React + Vite, Port: 5249)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9648)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9648`
- **Frontend 화면**: `http://localhost:5249`

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

- **가로등 고장 신고 대장**: 60건의 가로등 고장 민원(신고 코드, 고장 증상, 행정구역, 설치 위치, 신고 접수자, 담당 기사, 위험도) 관제.
- **가로등 시설물 & 기사**: 90개 스마트 가로등 시설물 위치 지도 & 25명 전문 전기점검 기사 명단 관리.
- **위치 로그 & 감사 이력**: 70건의 가로등 GPS 위치 검증 로그 & 90건의 시설물 관제 통합 감사 이력 관제.
- **점검 진행 상태**: 신고접수(REPORTED), 점검중(IN_PROGRESS), 조치완료(COMPLETED), 긴급출동(EMERGENCY), 신고취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 점검 상태를 조치완료(COMPLETED - 3초 지연 완료)로 변경 직후 위치 정보를 수정(0.1초 완료)하면, 위치 정보 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 위치 정보)을 덮어써 저장됩니다. 새로고침 시 점검 상태와 상세 패널의 위치 정보가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 신고 취소 API(0.5초 완료) 직후 점검 완료 API(4초 지연 완료) 호출 시, 신고 취소는 성공하지만 늦게 완료된 점검 완료 요청이 취소된 신고를 다시 `COMPLETED`(조치완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 신고 목록을 접수일 빠른 순 또는 위험도 높은 순으로 정렬 후 상세 버튼 클릭 시 `sortedReports` 배열 대신 원본 `reports[]` 배열의 같은 인덱스 신고가 선택됩니다.

4. **통계 집계 불일치**
   - 위치 로그 삭제(`DELETE /api/location-logs/:id`) 시 위치 로그 목록에서 소거되나 `lightStats`(구역별 고장률, 작업자별 처리량, 조치 완료율 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 행정구역 필터를 `강남구 테헤란로 권역`(3초 지연) → `서초구 반포대로 권역`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 테헤란로 권역 결과가 최신 반포대로 목록을 덮어써 신고 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김도시)에서 직원 B(이점검)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 미조치 수(`cachedUnprocessedCount`) 및 최근 신고 알림(`cachedRecentReport`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 점검 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `STREET LIGHT REPAIR COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 가로등 정보 수정(관리번호, 전구타입, 설치위치) 동시 수정 시 백엔드는 관리번호와 전구타입만 저장하고 설치위치는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `조치완료 변경 + 즉시 위치 정보 수정 (Error 1)` 클릭 ➔ 0.1초 후 위치 정보 수정 완료 ➔ 3초 후 조치완료 변경 완료 ➔ 새로고침 시 위치 정보가 롤백됨 확인.
2. **Error 2**: `⚡ 신고 취소 후 점검 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 신고 취소(CANCELLED) ➔ 4초 후 점검 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `신고 접수일 빠른 순` 정렬 선택 ➔ 최상단 신고 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 신고 데이터 표시됨 확인.
4. **Error 4**: 위치 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 위치 로그 목록에서 소거 ➔ 구역별 고장률 수치 변경되지 않음 확인.
5. **Error 5**: 행정구역 필터를 `강남구 테헤란로 권역` → 즉시 `서초구 반포대로 권역`으로 변경 ➔ 3초 후 테헤란로 권역 결과가 반포대로 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김도시(A)` → `이점검(B)`으로 전환 ➔ 목록은 갱신되나 상단 미조치 수치는 A 캐시(16건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 가로등 점검 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 STREET LIGHT REPAIR COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 가로등 정보 수정 > 관리번호, 전구타입, 설치위치 수정 후 `가로등 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 설치위치만 이전 값 유지됨 확인.
