# InstrumentFix (site152_악기수리접수관리_수리상태견적정보불일치)

수제 악기 수리 접수, 수리 견적 산출, 복원 작업 출고 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5252`

---

## 🏗️ 디렉토리 구조

```
site152_악기수리접수관리_수리상태견적정보불일치
├─ frontend (React + Vite, Port: 5252)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9651)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9651`
- **Frontend 화면**: `http://localhost:5252`

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

- **악기 수리 접수 대장**: 55건의 악기 수리 접수(접수 코드, 악기 카테고리, 악기명, 고객명, 보관 랙 번호, 수리 증상, 담당 루티어, 수리 견적금액) 관제.
- **보관 악기 & 산출 견적서**: 20개 공방 보관 악기 & 50건의 수리 부품 공임 산출 견적서 관리.
- **작업 로그 & 감사 이력**: 80건의 루티어 마스터 복원 작업 로그 & 90건의 공방 관제 통합 감사 이력 관제.
- **수리 진행 상태**: 접수완료(RECEIVED), 견적대기(ESTIMATING), 수리중(REPAIRING), 출고완료(COMPLETED), 수리취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 수리 상태를 수리중(REPAIRING - 3초 지연 완료)으로 변경 직후 견적 금액을 수정(0.1초 완료)하면, 견적 금액 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 견적 금액)을 덮어써 저장됩니다. 새로고침 시 수리 상태와 상세 패널의 견적 금액이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 수리 취소 API(0.5초 완료) 직후 출고 완료 API(4초 지연 완료) 호출 시, 수리 취소는 성공하지만 늦게 완료된 출고 완료 요청이 취소된 접수를 다시 `COMPLETED`(출고완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 접수 목록을 견적 금액 높은 순 또는 수리 접수일 빠른 순으로 정렬 후 상세 버튼 클릭 시 `sortedRepairs` 배열 대신 원본 `repairs[]` 배열의 같은 인덱스 접수가 선택됩니다.

4. **통계 집계 불일치**
   - 작업 로그 삭제(`DELETE /api/repair-logs/:id`) 시 작업 로그 목록에서 소거되나 `repairStats`(악기별 평균 수리비, 작업자별 처리량, 월별 출고 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 악기 종류 필터를 `현악기`(3초 지연) → `관악기`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 현악기 결과가 최신 관악기 목록을 덮어써 접수 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 직원 A(김수리)에서 직원 B(이견적)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 견적대기 수(`cachedEstimatingCount`) 및 최근 접수 알림(`cachedRecentRepair`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 출고 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `INSTRUMENT REPAIR CHECKOUT COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 고객 정보 수정(고객명, 보관 랙 번호, 연락처) 동시 수정 시 백엔드는 고객명과 보관 랙 번호만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `수리중 변경 + 즉시 견적 금액 수정 (Error 1)` 클릭 ➔ 0.1초 후 견적 금액 수정 완료 ➔ 3초 후 수리중 변경 완료 ➔ 새로고침 시 견적 금액이 롤백됨 확인.
2. **Error 2**: `⚡ 수리 취소 후 출고 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 수리 취소(CANCELLED) ➔ 4초 후 출고 완료가 COMPLETED로 복원됨 확인.
3. **Error 3**: 좌측 `견적 금액 높은 순` 정렬 선택 ➔ 최상단 접수 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 접수 데이터 표시됨 확인.
4. **Error 4**: 작업 로그 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 작업 로그 목록에서 소거 ➔ 악기별 평균 수리비 수치 변경되지 않음 확인.
5. **Error 5**: 악기 종류 필터를 `현악기 (바이올린 / 첼로 / 비올라)` → 즉시 `관악기 (플루트 / 색소폰 / 클라리넷)`으로 변경 ➔ 3초 후 현악기 결과가 관악기 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김수리(A)` → `이견적(B)`으로 전환 ➔ 목록은 갱신되나 상단 견적대기 수치는 A 캐시(12건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 악기 출고 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 INSTRUMENT REPAIR CHECKOUT COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 고객 정보 수정 > 고객명, 보관 랙 번호, 연락처 수정 후 `고객 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
