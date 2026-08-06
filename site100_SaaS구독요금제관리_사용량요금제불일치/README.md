# CloudPlan (site100_SaaS구독요금제관리_사용량요금제불일치)

SaaS 구독 요금제, 사용량, 팀 라이선스 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5200`

---

## 🏗️ 디렉토리 및 프로젝트 구조

```
site100_SaaS구독요금제관리_사용량요금제불일치
├─ frontend (React + Vite, Port: 5200)
│  ├─ package.json
│  ├─ index.html
│  ├─ vite.config.js
│  └─ src
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ api
│     │  └─ index.js
│     ├─ components
│     │  ├─ Header.jsx
│     │  ├─ Sidebar.jsx
│     │  ├─ CenterSection.jsx
│     │  ├─ RightPanel.jsx
│     │  └─ OrgEditModal.jsx
│     ├─ pages
│     │  └─ Home.jsx
│     └─ styles
│        └─ index.css
│
├─ backend (Node.js + Express, Port: 9599)
│  ├─ package.json
│  ├─ server.js
│  ├─ routes
│  │  └─ apiRoutes.js
│  ├─ controllers
│  │  └─ mainController.js
│  ├─ services
│  │  └─ dataService.js
│  └─ data
│     └─ data.json
│
└─ README.md
```

## 🚀 실행 포트 안내

- **Backend API**: `http://localhost:9599`
- **Frontend 화면**: `http://localhost:5200`

### 실행 방법 (서로 다른 터미널)

1. **백엔드 실행**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **프론트엔드 실행**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📋 정상 기능 요약

- **SaaS 구독 요금제 카탈로그**: Free, Basic, Pro, Business, Enterprise 5개 등급 플랜 및 사양 비교.
- **고객사 조직 구독 대장**: 10개 조직의 구독 플랜, 결제 이메일, 사업자번호 및 팀원 라이선스 소진율 관제.
- **팀원 라이선스 & 권한 관리**: 40명 팀원의 OWNER/ADMIN/DEVELOPER 권한 및 라이선스 할당/해제 관리.
- **API 사용량 & 청구 내역 대장**: 80건의 API 호출/저장공간 측정 로그 및 30건의 월별 청구 결제 내역 관리.

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류 목록

1. **Frontend + Backend 요청 순서 충돌**
   - **설명**: 요금제를 Pro/Business로 변경(3초 지연 완료)한 직후 팀원 라이선스 수를 변경(0.1초 완료)하면, 라이선스 수 변경 API는 먼저 완료되나 3초 뒤 완료되는 요금제 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 라이선스 수)을 덮어써 저장하여 새로고침 시 요금제 카드와 청구 예정 금액의 라이선스 수가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - **설명**: 구독 취소 API(0.5초 완료)를 호출한 직후 사용량 갱신 API를 호출(4초 지연 완료)하면, 구독 취소는 성공하지만 늦게 완료된 사용량 갱신 요청이 취소된 구독을 다시 ACTIVE 활성 상태로 복원시킵니다. 구독 설정에서는 취소됨, 사용량 대시보드에서는 활성 구독으로 표시됩니다.

3. **Frontend 정렬 인덱스 오류**
   - **설명**: 팀원 목록을 권한순/사용량순으로 정렬한 뒤 라이선스 변경 버튼을 누르면 UI 알림은 클릭한 팀원 이름으로 뜨지만, 백엔드 저장 데이터는 정렬 전 원본 배열의 다른 팀원 ID에 연결되는 결함입니다.

4. **통계 집계 불일치**
   - **설명**: 사용량 로그를 삭제(`DELETE /api/usage-logs/:id`) 처리하여 사용량 목록에서 소거하더라도, 월별 API 사용량(`saasStats.totalMonthlyApiCalls`), 초과 과금액, 청구 예정 금액 수치에는 차감되지 않고 계속 잔존합니다.

5. **Network stale response 오류**
   - **설명**: 요금제 필터('Enterprise' 3초 지연 ➔ 'Basic' 0.2초 완료)와 검색어를 빠르게 변경 시 오래된 응답(Enterprise)이 최신 조직 목록을 덮어써 조직 목록은 오래된 필터 결과, 오른쪽 사용량 요약은 최신 필터 기준 수치로 서로 불일치합니다.

6. **Session + Cache 잔존 오류**
   - **설명**: 관리자 A가 조직 설정을 본 뒤 관리자 B로 로그인하면 조직 목록은 B 권한 기준으로 바뀌지만, 상단 청구 예정 금액 및 최근 사용량 알림 캐시(`cachedExpectedBilling`, `cachedUsageAlert`)는 A 데이터가 남아 노출됩니다.

7. **Backend 권한 로그 오류**
   - **설명**: 권한 없는 일반 멤버(role !== 'ADMIN')가 요금제 변경 API(`PATCH /api/subscriptions/:id/plan-unauthorized`)를 호출하면 HTTP 403을 반환하지만, 서버 내부 활동 로그에는 '요금제 변경 성공 (SUBSCRIPTION PLAN CHANGED SUCCESSFULLY - 200 OK)'으로 잘못 기록됩니다.

8. **부분 저장 오류**
   - **설명**: 조직 정보 수정 모달/패널에서 조직명, 청구 이메일, 사업자등록번호를 동시에 수정하면 백엔드 data.json에는 조직명과 사업자번호만 저장되고 청구 이메일은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 표시합니다.

---

## 🧪 테스트 시나리오

1. **Error 1 테스트**: 우측 관제 패널에서 요금제 변경 선택 후 `요금제 변경 후 즉시 라이선스 수 수정 (Error 1)` 클릭 ➔ 0.1초 후 라이선스 수 수정 응답 ➔ 3초 후 요금제 변경 응답 완료 ➔ 새로고침 시 이전 라이선스 수로 롤백 저장됨을 확인.
2. **Error 2 테스트**: 우측 관제 패널에서 `⚡ 구독 취소 후 사용량 갱신 연쇄 호출 (Error 2)` 클릭 ➔ 0.5초 후 구독 취소 응답 ➔ 4초 후 사용량 갱신 응답 완료 ➔ 취소된 구독이 ACTIVE 활성 상태로 복원됨을 확인.
3. **Error 3 테스트**: 좌측 사이드바에서 `권한 높은순` 정렬 선택 ➔ 최상단 조직의 `상세` 클릭 ➔ UI 상단 조직ID와 우측 관제 패널의 청구 이메일/사업자 정보가 상이함을 확인.
4. **Error 4 테스트**: 중앙 사용량 대장에서 `🗑️ 사용량 로그 삭제` 클릭 ➔ 대장에서는 삭제되나 월별 사용량 및 청구 금액 수치가 유지됨을 확인.
5. **Error 5 테스트**: 좌측 요금제 필터를 `Enterprise` 선택 직후 `Basic` 선택 ➔ 3초 후 늦은 이전 Enterprise 결과가 최신 Basic 조직 목록을 덮어씀을 확인.
6. **Error 6 테스트**: 상단 로그인 관리자를 `김클라우드 CTO`에서 `이구독 리드`로 전환 ➔ 조직 목록은 B로 바뀌나 상단 KPI 청구 예정 금액은 A 데이터로 잔존함을 확인.
7. **Error 7 테스트**: 상단 계정을 일반 스태프로 테스트 시 `🔒 일반 멤버의 요금제 변경 시도` 클릭 ➔ UI/API는 HTTP 403 오류 반환 ➔ 백엔드 콘솔 로그에는 SUCCESS (200 OK)로 잘못 작성됨을 확인.
8. **Error 8 테스트**: 우측 하단 조직 정보 수정 패널에서 청구 이메일 포함 입력 후 `조직 정보 저장` 클릭 ➔ 토스트는 성공으로 표시되나 새로고침 시 청구 이메일만 수정되지 않았음을 확인.
