# AccountFlow (B-06)

AccountFlow는 회원가입, 가상 이메일 인증, 프로필 수정, 계정 설정 관리를 제공하는 학습용 SaaS 계정 관리 서비스입니다.

- 사이트 ID: B-06
- 학습 용도: Training
- 주요 확인전략: SEQUENCE_REPLAY
- Frontend: Next.js App Router, React
- Backend: Node.js, Express
- DB: SQLite

## 폴더 구조

```text
siteB06_회원가입계정관리/
├─ frontend/
└─ backend/
```

## 실행 방법

Backend:

```bash
cd siteB06_회원가입계정관리/backend
npm install
npm run dev
```

Frontend:

```bash
cd siteB06_회원가입계정관리/frontend
npm install
npm run dev
```

- Frontend 포트: `5321`
- Backend 포트: `9720`
- 브라우저 접속: `http://localhost:5321`
- Backend API: `http://localhost:9720`

## 정상 기능

회원가입 시작, 약관 동의, 이메일 형식 검증, 이메일 중복 확인, 비밀번호 검증, 비밀번호 일치 확인, 가상 인증 코드 발급/확인/재발급, 회원가입 완료, 로그인, 로그아웃, 프로필 조회, 프로필 사진 선택, 닉네임 수정, 연락처 수정, 비밀번호 변경, 알림 설정 변경, 계정 공개 여부 변경, 계정 상태 조회, 사용자 검색, 활동 로그 조회, 회원가입 진행 내역 조회, 계정 삭제, 테스트 데이터 초기화를 구현했습니다.

## API 엔드포인트

```text
GET    /api/health
GET    /api/users
GET    /api/users/:id
GET    /api/users/:id/profile
PATCH  /api/users/:id/profile
POST   /api/auth/signup/start
POST   /api/auth/check-email
POST   /api/auth/verification/send
POST   /api/auth/verification/confirm
POST   /api/auth/signup/complete
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/signup/progress/:id
PATCH  /api/signup/progress/:id
GET    /api/onboarding
GET    /api/accounts/:id/settings
PATCH  /api/accounts/:id/settings
PATCH  /api/accounts/:id/password
DELETE /api/accounts/:id
GET    /api/notifications
PATCH  /api/notifications/:id/read
GET    /api/activity
POST   /api/test/reset
```

## 의도적 오류 5개

1. `B06-ERR01`: 회원가입 다단계 입력 정보 유실
2. `B06-ERR02`: 온보딩 슬라이드 페이지 정보 누락
3. `B06-ERR03`: 프로필 수정 완료 피드백 누락
4. `B06-ERR04`: 계정 설정 캐시 불일치
5. `B06-ERR05`: 개인정보 수정 모달 취소 경로 차단

## 오류 재현 시나리오

- `B06-ERR01`: 가입 시작 → 약관 동의 → 계정 정보 입력 → 인증 완료 → 프로필 설정 → `이전 단계` 클릭 시 이전 계정 입력값 일부가 초기화됩니다.
- `B06-ERR02`: 회원가입 완료 후 온보딩에서 다음/이전 이동은 되지만 `3 / 8` 같은 페이지 번호와 진행 인디케이터가 없습니다.
- `B06-ERR03`: 대시보드에서 개인정보 수정 모달을 열고 닉네임 저장 시 프로필 카드는 갱신되지만 성공 토스트가 없습니다.
- `B06-ERR04`: 알림 설정에서 이메일 알림을 바꾸고 저장하면 토글은 바뀌지만 대시보드 요약 카드의 알림 상태는 이전 캐시를 유지합니다.
- `B06-ERR05`: 연락처 관리 모달에서 연락처를 변경한 뒤 취소 또는 닫기를 누르면 모달이 닫히지 않습니다.

## Reset API

`POST /api/test/reset`은 회원, 프로필, 가입 진행, 인증 기록, 설정, 프로필 변경 기록, 알림, 활동 로그, 온보딩 콘텐츠를 고정 seed 상태로 복원합니다.

## DQN Evidence

오류별 확인은 UI, DOM, Network, State Evidence를 비교하도록 구성했습니다. 상세 Oracle과 action sequence는 `BUGS.md`를 확인하세요. 구현 및 검증 체크리스트는 `TODO.md`에 있습니다.
