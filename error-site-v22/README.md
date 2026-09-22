# error-site-v22 — 취미 커뮤니티

React/Vite + Express + SQLite 기반의 **의도적 오류 테스트 사이트**입니다.  
기준 샘플 `RL_Error_Test_error-site-v1`의 실행/문서 전달 형식을 유지하면서, `Community` 계열의 UI/DOM과 기능 흐름으로 변형했습니다.

## 포함 오류

`IDOR`, `permission-drift`, `stored-xss`, `sql-injection`, `system-info-disclosure`, `logout-reuse`, `idempotency`, `async-no-feedback`

상세 재현 조건과 evidence는 [`BUGS.md`](BUGS.md), 구조화 데이터는 [`bug_catalog.json`](bug_catalog.json)을 참고하세요.

## 요구 환경

- Node.js 24 이상
- npm

Node.js 24의 내장 `node:sqlite`를 사용하므로 별도 SQLite 설치는 필요하지 않습니다.

## 실행 방법

터미널을 두 개 열고 각각 실행합니다.

### Backend

```bash
cd backend
npm install
npm run dev
```

- Backend: `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`

## 테스트 계정

- 사용자 A: `userA@test.com` / `1234`
- 사용자 B: `userB@test.com` / `1234`
- 관리자: `admin@test.com` / `1234`

두 일반 사용자 계정은 IDOR 등 사용자 간 접근 제어 재현에 사용합니다.

## 데이터 초기화

1. Backend 서버를 종료합니다.
2. `backend/data/site.sqlite`를 삭제합니다.
3. Backend를 다시 실행합니다.

```bash
cd backend
npm run dev
```

DB와 기본 테스트 데이터가 자동 재생성됩니다.

## 주요 API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/items`
- `GET|POST /api/cart`
- `GET /api/private-records/:id`
- `GET /api/admin/protected`
- `POST /api/admin/demote-self`
- `GET /api/admin/privileged`
- `GET /api/echo`
- `GET|POST /api/notes`
- `GET /api/search`
- `POST /api/parse`
- `GET /api/header-check`
- `POST /api/checkout`
- `POST /api/transactions`
- `POST /api/slow-action`

## safe_fixture / reward 처리

- `safe_fixture`는 각 오류의 `BUGS.md` / `bug_catalog.json`에 원본 CSV 값을 유지합니다.
- 테스트는 로컬 fixture 데이터와 테스트 계정 범위에서 수행합니다.
- **reward 기준은 사이트 코드에 구현하지 않습니다.** 팀 지시대로 RAWD 학습 쪽에서 처리합니다.

## 문서 전달 체크

- [x] 실행 방법
- [x] 테스트 계정
- [x] 데이터 초기화 방법
- [x] API 전용 / UI 재현 범위 구분
- [x] 정상 동작 / 의도적 오류 동작
- [x] oracle / evidence
