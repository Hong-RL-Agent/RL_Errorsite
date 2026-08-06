# LegalFlow (site125_법무계약서검토관리_검토상태조항수정불일치)

기업 법무 계약서 검토, 조항 리스크 심사, 최종 승인 관제 시스템

## 🌐 브라우저 접속 주소
`http://localhost:5225`

---

## 🏗️ 디렉토리 구조

```
site125_법무계약서검토관리_검토상태조항수정불일치
├─ frontend (React + Vite, Port: 5225)
│  ├─ package.json / index.html / vite.config.js
│  └─ src
│     ├─ main.jsx / App.jsx
│     ├─ api/index.js
│     ├─ components (Header, Sidebar, CenterSection, RightPanel)
│     ├─ pages/Home.jsx
│     └─ styles/index.css
│
├─ backend (Node.js + Express, Port: 9624)
│  ├─ package.json / server.js
│  ├─ routes/apiRoutes.js
│  ├─ controllers/mainController.js
│  ├─ services/dataService.js
│  └─ data/data.json
│
└─ README.md
```

## 🚀 실행 포트

- **Backend API**: `http://localhost:9624`
- **Frontend 화면**: `http://localhost:5225`

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

- **계약서 검토 대장**: 45건의 법무 계약서(상대 거래처명, 핵심 리스크 조항 요약, 리스크 점수, 만료일) 관제.
- **협력 거래처 명단**: 30개사 주요 계약 상대 거래처 및 리스크 등급 관리.
- **검토 의견 & 조항 심사**: 120개 조항 데이터 & 80건의 법무팀 검토 의견 타임라인 관리.
- **검토 감사 로그**: 90건의 계약 심사 활동 감사 로그 관리.
- **검토 상태**: 검토요청(REQUESTED), 검토중(UNDER_REVIEW), 승인대기(APPROVAL_PENDING), 승인완료(APPROVED), 반려됨(REJECTED).

---

## ⚠️ 의도적으로 삽입된 8가지 복합 오류

1. **Frontend + Backend 요청 순서 충돌**
   - 검토 상태를 승인대기(APPROVAL_PENDING - 3초 지연 완료)로 변경 직후 중요 조항을 수정(0.1초 완료)하면, 조항 수정 API는 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 조항)을 덮어써 저장됩니다. 새로고침 시 계약서 목록의 조항과 상세 패널의 조항이 서로 달라집니다.

2. **Backend + JSON DB 상태 충돌**
   - 계약 반려 API(0.5초 완료) 직후 검토 의견 작성 API(4초 지연 완료) 호출 시, 계약 반려는 성공하지만 늦게 완료된 검토 의견 작성 요청이 반려된 계약을 다시 `UNDER_REVIEW`(검토중) 상태로 복원합니다.

3. **Frontend 정렬 인덱스 오류**
   - 계약서 목록을 위험도 점수순으로 정렬 후 상세 버튼 클릭 시 `sortedContracts` 배열 대신 원본 `contracts[]` 배열의 같은 인덱스 계약이 선택됩니다.

4. **통계 집계 불일치**
   - 검토 의견 삭제(`DELETE /api/comments/:id`) 시 의견 목록에서 소거되나 `legalStats`(거래처별 리스크 점수, 계약 승인율 통계) 수치에는 삭제 전 수치가 잔존합니다.

5. **Network stale response 오류**
   - 거래처 필터를 `삼성전자`(3초 지연) → `현대자동차`(0.2초) 순으로 빠르게 변경 시, 늦게 응답된 삼성전자 결과가 최신 현대자동차 계약 목록을 덮어써 계약 목록과 오른쪽 요약이 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 담당자 A(김법무)에서 담당자 B(이계약)로 전환 시 목록은 B 권한 기준으로 갱신되나, 상단 검토 대기 수(`cachedPendingReviewCount`) 및 최근 계약 알림(`cachedRecentContract`)에는 A의 데이터가 잔존합니다.

7. **Backend 권한 로그 오류**
   - 권한 없는 직원이 계약 최종승인 API를 호출하면 HTTP 403 Forbidden을 반환하지만, 서버 감사 로그에는 `CONTRACT FINAL APPROVED SUCCESSFULLY (200 OK)`로 잘못 기록됩니다.

8. **부분 저장 오류**
   - 계약 정보 수정(계약명, 만료일, 거래처명) 동시 수정 시 백엔드는 계약명과 거래처명만 저장하고 만료일은 이전 값으로 유지하나, 프론트엔드 UI에는 세 항목 모두 저장 성공으로 표시됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1**: 우측 패널 > `승인대기 변경 + 즉시 조항 수정 (Error 1)` 클릭 ➔ 0.1초 후 조항 수정 완료 ➔ 3초 후 승인대기 변경 완료 ➔ 새로고침 시 조항 내용이 롤백됨 확인.
2. **Error 2**: `⚡ 계약 반려 후 검토 의견 작성 연쇄 실행 (Error 2)` 클릭 ➔ 0.5초 후 계약 반려(REJECTED) ➔ 4초 후 의견 작성이 UNDER_REVIEW로 복원됨 확인.
3. **Error 3**: 좌측 `법무 리스크 점수 높은순` 정렬 선택 ➔ 최상단 계약 `상세 (E3)` 클릭 ➔ 우측 패널에 다른 계약 데이터 표시됨 확인.
4. **Error 4**: 검토 의견 탭 > `🗑️ 삭제 (E4)` 클릭 ➔ 검토 의견 목록에서 소거 ➔ 거래처별 리스크 점수 수치 변경되지 않음 확인.
5. **Error 5**: 거래처 필터를 `삼성전자` → 즉시 `현대자동차`로 변경 ➔ 3초 후 삼성전자 결과가 현대자동차 목록을 덮어씀 확인.
6. **Error 6**: 상단 담당자를 `김법무(A)` → `이계약(B)`으로 전환 ➔ 목록은 갱신되나 상단 검토대기 수치는 A 캐시(18건) 잔존 확인.
7. **Error 7**: 감사 로그 탭 > `🔒 권한 없는 직원의 계약 최종승인 (Error 7)` 클릭 ➔ UI는 403 오류 ➔ 백엔드 콘솔에는 CONTRACT FINAL APPROVED SUCCESSFULLY 기록됨 확인.
8. **Error 8**: 우측 계약 정보 수정 > 계약명, 만료일, 거래처명 수정 후 `계약 정보 저장 (Error 8)` 클릭 ➔ 토스트는 성공 ➔ 새로고침 시 만료일만 이전 값 유지됨 확인.
