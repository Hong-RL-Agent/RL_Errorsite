# ShuttleCampus (site147_캠퍼스셔틀운행관리_배차상태승차인원불일치)

대학교 캠퍼스 셔틀버스 노선, 배차, 승차 인원 및 혼잡도 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5247`

---

## 🏗️ 디렉토리 구조

```
site147_캠퍼스셔틀운행관리_배차상태승차인원불일치
├─ frontend (React + Vite, Port: 5247)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9646)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9646`
- **Frontend 화면**: `http://localhost:5247`

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

- **셔틀버스 운행 배차 대장**: 60건의 셔틀 운행 배차(배차 코드, 노선 명칭, 차량번호, 담당 기사, 출발/도착시각, 승차인원, 혼잡도) 관제.
- **노선 타임라인 & 버스**: 12개 대학교 셔틀 노선 & 25대 셔틀버스 차종 & 25명 운전기사 대장 관리.
- **NFC 스마트 태그 & 감사로그**: 100건의 학생증 NFC 승차 태그 로그 & 90건의 셔틀 관제 통합 감사 이력 관제.
- **배차 진행 상태**: 배차완료(SCHEDULED), 운행중(IN_SERVICE), 운행완료(COMPLETED), 지연운행(DELAYED), 운행취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 운행 상태를 운행중(IN_SERVICE - 3초 지연 완료)으로 변경 직후 승차 인원을 수정(0.1초 완료)하면, 인원 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 승차 인원)을 덮어써 저장됩니다. 새로고침 시 운행 상태와 상세 패널의 승차 인원이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 운행 취소 API(0.5초 완료) 직후 승차 기록 등록 API(4초 지연 완료) 호출 시, 운행 취소는 성공하지만 늦게 완료된 승차 기록 등록 요청이 취소된 운행을 다시 `COMPLETED`(운행완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 운행 목록을 승차인원 많은 순 또는 출발 시각 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedSchedules` 배열 대신 원본 `schedules[]` 배열의 같은 인덱스 운행이 선택됩니다.

4. **통계 집계 불일치**
   - 승차 기록 삭제(`DELETE /api/boarding-logs/:id`) 시 승차 기록 목록에서 소거되나 `shuttleStats`(노선별 혼잡도, 기사별 운행 수, 시간대별 승차 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 셔틀 노선 필터를 `정문-공학관 순환선 (A노선)`(3초 지연) → `기숙사-지하철역 직행 (B노선)`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 A노선 결과가 최신 B노선 목록을 덮어써 운행 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 관리자 A(김캠퍼스)에서 관리자 B(이배차)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 지연 운행 수(`cachedDelayedCount`) 및 최근 운행 알림(`cachedRecentSchedule`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 운행 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `SHUTTLE SERVICE COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 버스 정보 수정(차량번호, 좌석수, 담당기사) 동시 수정 시 백엔드는 차량번호와 담당기사만 저장하고 좌석수는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `운행중 변경 + 즉시 승차인원 수정 (Error 1)` 클릭 ➔ 0.1초 후 승차인원 수정 완료 ➔ 3초 후 운행중 변경 완료 ➔ 새로고침 시 승차인원이 롤백됨 확인.
2. **Error 2**: `⚡ 운행 취소 후 승차 기록 등록 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 운행 취소(CANCELLED) ➔ 4초 후 승차 기록 등록이 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `승차인원 많은 순` 정렬 선택 ➔ 최상단 배차 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 배차 데이터 표시됨 확인.
4. **Error 4**: 승차 태그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 승차 기록 목록에서 소거 ➔ 노선별 혼잡도 수치 변경되지 않음 확인.
5. **Error 5**: 노선 필터를 `정문-공학관 순환선 (A노선)` → 즉시 `기숙사-지하철역 직행 (B노선)`으로 변경 ➔ 3초 후 A노선 결과가 B노선 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김캠퍼스(A)` → `이배차(B)`로 전환 ➔ 목록은 갱신되나 상단 지연 운행 수치는 A 캐시(5대) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 셔틀 운행 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 SHUTTLE SERVICE COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 버스 정보 수정 > 차량번호, 담당기사, 좌석수 수정 후 `버스 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 좌석수만 이전 값 유지됨 확인.
