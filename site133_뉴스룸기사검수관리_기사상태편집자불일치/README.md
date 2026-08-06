# NewsDesk (site133_뉴스룸기사검수관리_기사상태편집자불일치)

뉴스룸 기사 작성, 데스크 편집 검수, 발행 상태 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5233`

---

## 🏗️ 디렉토리 구조

```
site133_뉴스룸기사검수관리_기사상태편집자불일치
├─ frontend (React + Vite, Port: 5233)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9632)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9632`
- **Frontend 화면**: `http://localhost:5233`

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

- **뉴스룸 기사 검수 대장**: 55개 송고 기사(기사 코드, 헤드라인 제목, 카테고리, 취재 기자, 담당 편집자, 조회수, 발행예정시각) 관제.
- **취재 기자 & 데스크 에디터**: 25명 언론사 취재 기자 & 12명 데스크 에디터 현황 관리.
- **검수 메모 & 발행 이력**: 80건의 데스크 검수 의견 피드백, 70건의 최종 발행 로그 & 90건의 감사 이력 관제.
- **기사 상태**: 초안작성(DRAFT), 검수중(REVIEWING), 승인완료(APPROVED), 발행예약(SCHEDULED), 최종발행(PUBLISHED), 반려됨(REJECTED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 기사 상태를 발행예약(SCHEDULED - 3초 지연 완료)으로 변경 직후 담당 편집자를 변경(0.1초 완료)하면, 편집자 변경 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 담당 편집자)을 덮어써 저장됩니다. 새로고침 시 기사의 발행상태와 상세 패널의 담당 편집자가 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 기사 삭제 API(0.5초 완료) 직후 검수 의견 작성 API(4초 지연 완료) 호출 시, 기사 삭제는 성공하지만 늦게 완료된 검수 의견 작성 요청이 삭제된 기사를 다시 `REVIEWING`(검수중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 기사 목록을 조회수순 또는 기사코드순으로 정렬 후 상세 버튼 클릭 시 `sortedArticles` 배열 대신 원본 `articles[]` 배열의 같은 인덱스 기사가 선택됩니다.

4. **통계 집계 불일치**
   - 발행 로그 삭제(`DELETE /api/publish-logs/:id`) 시 발행 로그 목록에서 소거되나 `newsStats`(카테고리별 발행 수, 기자별 기사 수 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 카테고리 필터를 `정치/사회`(3초 지연) → `IT/과학`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 정치/사회 결과가 최신 IT/과학 기사 목록을 덮어써 기사 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 편집자 A(김편집)에서 편집자 B(이데스크)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 검수대기 수(`cachedReviewingCount`) 및 최근 기사 알림(`cachedRecentArticle`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 기자가 최종 발행 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `ARTICLE PUBLISHED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 기사 메타정보 수정(제목, 카테고리, 발행예정시각) 동시 수정 시 백엔드는 제목과 발행예정시각만 저장하고 카테고리는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `발행예약 변경 + 즉시 편집자 변경 (Error 1)` 클릭 ➔ 0.1초 후 편집자 변경 완료 ➔ 3초 후 발행예약 변경 완료 ➔ 새로고침 시 담당 편집자가 롤백됨 확인.
2. **Error 2**: `⚡ 기사 삭제 후 검수 의견 작성 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 기사 삭제(소거) ➔ 4초 후 검수 의견 작성이 REVIEWING으로 복원됨 확인.
3. **Error 3**: 좌측 `조회수 높은순` 정렬 선택 ➔ 최상단 기사 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 기사 데이터 표시됨 확인.
4. **Error 4**: 발행 이력 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 발행 로그 목록에서 소거 ➔ 카테고리별 발행 수 수치 변경되지 않음 확인.
5. **Error 5**: 카테고리 필터를 `정치/사회` → 즉시 `IT/과학`으로 변경 ➔ 3초 후 정치/사회 결과가 IT/과학 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김편집(A)` → `이데스크(B)`으로 전환 ➔ 목록은 갱신되나 상단 검수대기 수치는 A 캐시(15건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 기자의 기사 최종 발행 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 ARTICLE PUBLISHED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 기사 메타정보 수정 > 제목, 카테고리, 발행예정시각 수정 후 `기사 메타정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 카테고리만 이전 값 유지됨 확인.
