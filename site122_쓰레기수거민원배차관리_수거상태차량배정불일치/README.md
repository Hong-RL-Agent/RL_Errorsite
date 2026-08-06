# CleanRoute (site122_쓰레기수거민원배차관리_수거상태차량배정불일치)

도시 쓰레기 수거 일정, 청소 차량 배차, 시민 환경 민원 통합 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5222`

---

## 🏗️ 디렉토리 구조

```
site122_쓰레기수거민원배차관리_수거상태차량배정불일치
├─ frontend (React + Vite, Port: 5222)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9621)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9621`
- **Frontend 화면**: `http://localhost:5222`

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

- **수거 일정 대장**: 50개 구역별 생활폐기물 수거 일정(예정일시, 배정 차량, 민원 건수) 관제.
- **수거 구역 & 차량 배차**: 20개 자치구 지정 수거 구역 & 25대 청소 차량 배차 현황 관리.
- **환경 민원 및 수거 로그**: 45건의 시민 환경 민원, 100건의 수거 실적 로그, 90건의 감사 이력 관리.
- **수거 상태**: 접수대기(PENDING), 차량배정(ASSIGNED), 수거진행중(IN_PROGRESS), 수거완료(COMPLETED), 취소됨(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 수거 상태를 수거진행중(IN_PROGRESS - 3초 지연 완료)으로 변경 직후 차량을 변경(0.1초 완료)하면, 차량 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 차량)을 덮어써 저장됩니다. 새로고침 시 수거 일정의 차량과 상세 패널의 차량이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 수거 취소 API(0.5초 완료) 직후 민원 처리완료 API(4초 지연 완료) 호출 시, 수거 취소는 성공하지만 늦게 완료된 민원 처리완료 요청이 취소된 수거를 다시 `COMPLETED`(수거완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 수거 일정 목록을 민원 건수순으로 정렬 후 상세 버튼 클릭 시 `sortedSchedules` 배열 대신 원본 `schedules[]` 배열의 같은 인덱스 일정이 선택됩니다.

4. **통계 집계 불일치**
   - 수거 로그 삭제(`DELETE /api/pickup-logs/:id`) 시 로그 목록에서 소거되나 `cleanStats`(구역별 수거량, 차량별 작업량 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 구역 필터를 `ZONE-01 종로1가`(3초 지연) → `ZONE-02 강남역`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 종로1가 결과가 최신 강남역 수거 목록을 덮어써 수거 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김청소)에서 직원 B(이배차)로 전환 시 목록은 B 담당 기준으로 갱신되나, 상단 미처리 민원 수(`cachedPendingComplaintCount`) 및 최근 상세 알림(`cachedRecentSchedule`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 수거 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `COLLECTION COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 차량 정보 수정(차량번호, 담당구역, 정비상태) 동시 수정 시 백엔드는 차량번호와 정비상태만 저장하고 담당구역은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `진행중 변경 + 즉시 차량 변경 (Error 1)` 클릭 ➔ 0.1초 후 차량 변경 완료 ➔ 3초 후 진행중 변경 완료 ➔ 새로고침 시 차량 배정이 롤백됨 확인.
2. **Error 2**: `⚡ 수거 취소 후 민원 처리완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 수거 취소(CANCELLED) ➔ 4초 후 민원 처리완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `민원 건수 많은순` 정렬 선택 ➔ 최상단 일정 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 일정 데이터 표시됨 확인.
4. **Error 4**: 민원 & 수거 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 수거 로그 목록에서 소거 ➔ 구역별 수거량 수치 변경되지 않음 확인.
5. **Error 5**: 구역 필터를 `종로1가` → 즉시 `강남역`으로 변경 ➔ 3초 후 종로1가 결과가 강남역 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김청소(A)` → `이배차(B)`으로 전환 ➔ 목록은 갱신되나 상단 미처리 민원 수치는 A 캐시(12건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 수거 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 COLLECTION COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 차량 정보 수정 > 차량번호, 담당구역, 정비상태 수정 후 `차량 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 담당구역만 이전 값 유지됨 확인.
