# BookDonate (site136_도서기증분류관리_기증상태분류정보불일치)

공공 도서 기증 접수, KDC 십진분류, 나눔 배포처 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5236`

---

## 🏗️ 디렉토리 구조

```
site136_도서기증분류관리_기증상태분류정보불일치
├─ frontend (React + Vite, Port: 5236)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9635)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9635`
- **Frontend 화면**: `http://localhost:5236`

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

- **기증 도서 분류 대장**: 70권의 기증 도서(도서 코드, 기증 도서 제목, 저자, KDC 분야, 보존 상태등급, 기증자 성명, 배정 배포처, 접수일) 관제.
- **기증자 & 배포처 기관**: 35명 개인/단체 기증자 명단 & 20개 도서 나눔 지원 배포처 관제.
- **KDC 분류 로그**: 80건의 십진분류 및 사서 검수 로그 & 90건의 기증 도서 관리 감사 이력 관제.
- **기증/분류 상태**: 접수대기(PENDING), 상태검수중(INSPECTING), 분류완료(CLASSIFIED), 배포준비(READY_TO_DISTRIBUTE), 배포완료(DISTRIBUTED), 기증취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 기증 상태를 분류완료(CLASSIFIED - 3초 지연 완료)로 변경 직후 배포처를 변경(0.1초 완료)하면, 배포처 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 배포처)을 덮어써 저장됩니다. 새로고침 시 기증 도서 상태와 상세 패널의 배포처가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 기증 취소 API(0.5초 완료) 직후 배포 완료 API(4초 지연 완료) 호출 시, 기증 취소는 성공하지만 늦게 완료된 배포 완료 요청이 취소된 기증 도서를 다시 `DISTRIBUTED`(배포완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 도서 목록을 상태등급순 또는 기증 접수일순으로 정렬 후 상세 버튼 클릭 시 `sortedBooks` 배열 대신 원본 `books[]` 배열의 같은 인덱스 도서가 선택됩니다.

4. **통계 집계 불일치**
   - 분류 로그 삭제(`DELETE /api/classify-logs/:id`) 시 분류 로그 목록에서 소거되나 `donateStats`(분야별 도서 수, 배포처별 배정 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 분야 필터를 `인문/사회`(3초 지연) → `자연과학`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 인문/사회 결과가 최신 자연과학 도서 목록을 덮어써 도서 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 담당 사서 A(김기증)에서 담당 사서 B(이분류)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 분류대기 수(`cachedPendingCount`) 및 최근 도서 알림(`cachedRecentBook`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 배포 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `BOOK DISTRIBUTION COMPLETED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 도서 정보 수정(제목, 저자, 보존등급) 동시 수정 시 백엔드는 제목과 보존등급만 저장하고 저자는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `분류완료 변경 + 즉시 배포처 변경 (Error 1)` 클릭 ➔ 0.1초 후 배포처 변경 완료 ➔ 3초 후 분류완료 변경 완료 ➔ 새로고침 시 배포처가 롤백됨 확인.
2. **Error 2**: `⚡ 기증 취소 후 배포 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 기증 취소(CANCELLED) ➔ 4초 후 배포 완료가 DISTRIBUTED로 복원됨 확인.
3. **Error 3**: 좌측 `도서 보존등급 높은순` 정렬 선택 ➔ 최상단 도서 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 도서 데이터 표시됨 확인.
4. **Error 4**: KDC 분류 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 분류 로그 목록에서 소거 ➔ 분야별 도서 수 수치 변경되지 않음 확인.
5. **Error 5**: 분야 필터를 `인문/사회` → 즉시 `자연과학`으로 변경 ➔ 3초 후 인문/사회 결과가 자연과학 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김기증(A)` → `이분류(B)`으로 전환 ➔ 목록은 갱신되나 상단 분류대기 수치는 A 캐시(18권) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 배포 완료 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 BOOK DISTRIBUTION COMPLETED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 도서 정보 수정 > 제목, 저자, 보존등급 수정 후 `도서 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 저자만 이전 값 유지됨 확인.
