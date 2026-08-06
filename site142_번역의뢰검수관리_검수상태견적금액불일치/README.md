# TransDesk (site142_번역의뢰검수관리_검수상태견적금액불일치)

글로벌 전문 번역 의뢰, 번역가 배정, 검수 및 견적 관리 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5242`

---

## 🏗️ 디렉토리 구조

```
site142_번역의뢰검수관리_검수상태견적금액불일치
├─ frontend (React + Vite, Port: 5242)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9641)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9641`
- **Frontend 화면**: `http://localhost:5242`

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

- **번역 의뢰 관제 대장**: 50건의 전문 번역 의뢰(의뢰 코드, 프로젝트 제목, 고객사, 언어쌍, 단어 분량, 담당 번역가, 견적 금액) 관제.
- **고객사 & 번역가 명단**: 35명 엔터프라이즈 고객사 명단 & 25명 글로벌 검증 전문 번역가 관리.
- **검수 피드백 & 감사 로그**: 70건의 원문 감수 의견 및 품질 점수 & 90건의 번역 플랫폼 통합 감사 이력 관제.
- **검수/납품 진행 상태**: 의뢰접수(PENDING), 견적산정(QUOTED), 번역중(IN_TRANSLATION), 검수완료(IN_REVIEW), 납품완료(DELIVERED), 의뢰취소(CANCELLED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 검수 상태를 검수완료(IN_REVIEW - 3초 지연 완료)로 변경 직후 견적 금액을 수정(0.1초 완료)하면, 금액 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 견적 금액)을 덮어써 저장됩니다. 새로고침 시 검수 상태와 상세 패널의 견적 금액이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 의뢰 취소 API(0.5초 완료) 직후 납품 완료 API(4초 지연 완료) 호출 시, 의뢰 취소는 성공하지만 늦게 완료된 납품 완료 요청이 취소된 의뢰를 다시 `DELIVERED`(납품완료) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 의뢰 목록을 견적 금액 높은 순 또는 마감일 임박 순으로 정렬 후 상세 버튼 클릭 시 `sortedRequests` 배열 대신 원본 `requests[]` 배열의 같은 인덱스 의뢰가 선택됩니다.

4. **통계 집계 불일치**
   - 검수 의견 삭제(`DELETE /api/review-comments/:id`) 시 검수 의견 목록에서 소거되나 `transStats`(번역가별 품질점수, 언어쌍별 평균 견적, 납품 완료율 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 언어쌍 필터를 `한국어 ➔ 영어`(3초 지연) → `한국어 ➔ 일본어`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 한국어 ➔ 영어 결과가 최신 일본어 의뢰 목록을 덮어써 의뢰 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 매니저 A(김번역)에서 매니저 B(이검수)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 검수대기 수(`cachedReviewingCount`) 및 최근 의뢰 알림(`cachedRecentRequest`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 견적 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `QUOTE CONFIRMED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 고객 정보 수정(이름, 회사명, 연락처) 동시 수정 시 백엔드는 이름과 회사명만 저장하고 연락처는 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `검수완료 변경 + 즉시 견적 수정 (Error 1)` 클릭 ➔ 0.1초 후 금액 수정 완료 ➔ 3초 후 검수완료 변경 완료 ➔ 새로고침 시 견적 금액이 롤백됨 확인.
2. **Error 2**: `⚡ 의뢰 취소 후 납품 완료 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 의뢰 취소(CANCELLED) ➔ 4초 후 납품 완료가 DELIVERED로 복원됨 확인.
3. **Error 3**: 좌측 `견적 금액 높은 순` 정렬 선택 ➔ 최상단 의뢰 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 의뢰 데이터 표시됨 확인.
4. **Error 4**: 검수 의견 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 검수 의견 목록에서 소거 ➔ 번역가별 품질점수 수치 변경되지 않음 확인.
5. **Error 5**: 언어쌍 필터를 `한국어 ➔ 영어` → 즉시 `한국어 ➔ 일본어`로 변경 ➔ 3초 후 한국어 ➔ 영어 결과가 일본어 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김번역(A)` → `이검수(B)`로 전환 ➔ 목록은 갱신되나 상단 검수대기 수치는 A 캐시(16건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 견적 확정 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 QUOTE CONFIRMED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 고객 정보 수정 > 이름, 회사명, 연락처 수정 후 `고객 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 연락처만 이전 값 유지됨 확인.
