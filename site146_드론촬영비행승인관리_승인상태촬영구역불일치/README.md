# DronePermit (site146_드론촬영비행승인관리_승인상태촬영구역불일치)

드론 항공 촬영 의뢰, 비행 관제 승인, 영공 안전 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5246`

---

## 🏗️ 디렉토리 구조

```
site146_드론촬영비행승인관리_승인상태촬영구역불일치
├─ frontend (React + Vite, Port: 5246)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9645)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9645`
- **Frontend 화면**: `http://localhost:5246`

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

- **드론 촬영 승인 대장**: 50건의 항공 촬영 의뢰(의뢰 코드, 프로젝트명, 관제 지역, 촬영 구역, 신청 기관, 조종자, 최고 고도) 관제.
- **구역 지도 & 드론 기체**: 35개 촬영 제한/금지구역 SVG 지도 & 25대 산업용 드론 기체 & 20명 국가 자격 조종자 대장 관리.
- **비행 로그 & 관제 감사**: 80건의 실시간 드론 비행 블랙박스 로그 & 90건의 비행 관제 통합 감사 이력 관제.
- **승인 진행 상태**: 승인대기(PENDING), 승인완료(APPROVED), 비행중(IN_FLIGHT), 촬영완료(COMPLETED), 승인취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 승인 상태를 승인완료(APPROVED - 3초 지연 완료)로 변경 직후 촬영 구역을 변경(0.1초 완료)하면, 구역 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 촬영 구역)을 덮어써 저장됩니다. 새로고침 시 승인 상태와 상세 패널의 촬영 구역이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 승인 취소 API(0.5초 완료) 직후 촬영 완료 API(4초 지연 완료) 호출 시, 승인 취소는 성공하지만 늦게 완료된 촬영 완료 요청이 취소된 의뢰를 다시 `COMPLETED`(촬영완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 의뢰 목록을 촬영 일자 빠른 순 또는 최고 고도 높은 순으로 정렬 후 상세 버튼 클릭 시 `sortedRequests` 배열 대신 원본 `requests[]` 배열의 같은 인덱스 의뢰가 선택됩니다.

4. **통계 집계 불일치**
   - 비행 로그 삭제(`DELETE /api/flight-logs/:id`) 시 비행 로그 목록에서 소거되나 `flightStats`(조종자별 비행시간, 지역별 승인률, 드론별 사용률 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 관제 지역 필터를 `서울 강남 관제권`(3초 지연) → `인천 송도 비행금지구역`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 강남 관제권 결과가 최신 송도 구역 목록을 덮어써 의뢰 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김항공)에서 관리자 B(이조종)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 승인대기 수(`cachedPendingCount`) 및 최근 의뢰 알림(`cachedRecentRequest`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 비행 승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `FLIGHT PERMIT APPROVED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 드론 정보 수정(드론명, 배터리상태, 담당조종자) 동시 수정 시 백엔드는 드론명과 담당조종자만 저장하고 배터리상태는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `승인완료 변경 + 즉시 촬영구역 변경 (Error 1)` 클릭 ➔ 0.1초 후 구역 변경 완료 ➔ 3초 후 승인완료 변경 완료 ➔ 새로고침 시 촬영 구역이 롤백됨 확인.
2. **Error 2**: `⚡ 승인 취소 후 촬영 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 승인 취소(CANCELLED) ➔ 4초 후 촬영 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `촬영 일자 빠른 순` 정렬 선택 ➔ 최상단 의뢰 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 의뢰 데이터 표시됨 확인.
4. **Error 4**: 비행 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 비행 로그 목록에서 소거 ➔ 조종자별 비행시간 수치 변경되지 않음 확인.
5. **Error 5**: 관제 지역 필터를 `서울 강남 관제권` → 즉시 `인천 송도 비행금지구역`으로 변경 ➔ 3초 후 강남 관제권 결과가 송도 구역 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김항공(A)` → `이조종(B)`으로 전환 ➔ 목록은 갱신되나 상단 승인대기 수치는 A 캐시(12건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 비행 승인 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 FLIGHT PERMIT APPROVED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 드론 정보 수정 > 드론명, 담당조종자, 배터리상태 수정 후 `드론 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 배터리상태만 이전 값 유지됨 확인.
