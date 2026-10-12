# PrefSpace - 사용자 환경설정 및 계정 관리 서비스 (D-07)

PrefSpace는 SaaS 플랫폼 환경에서 사용자가 개인 프로필, 화면 테마(라이트/다크), 다국어 언어팩, 이메일/푸시 알림 수신 여부, 개인정보 공개 범위, 글로벌 표준 시간대를 편리하게 설정하고 영속 관리할 수 있는 사용자 환경설정 플랫폼입니다.

본 프로젝트는 **Frontend (React + Vite)**와 **Backend (Node.js + Express + SQLite)**가 독립된 프로세스로 실행되며 실제 REST API 통신 및 멱등성 상태 리셋을 완벽하게 지원합니다.

---

## 1. 프로젝트 구조

```
D-07/
├── backend/                       # REST API 백엔드 서버 (Express + SQLite)
│   ├── .env                       # 서버 환경변수 (포트 9807)
│   ├── package.json               # express, sqlite3, cors, dotenv 의존성
│   ├── db.js                      # 6명 테스트 계정 및 환경설정 시드, 멱등 resetAllData()
│   ├── server.js                  # Express REST API 라우터 및 5대 STATE_REVISIT 버그 로직
│   └── prefspace.db               # SQLite 데이터베이스 파일
├── frontend/                      # 프론트엔드 웹 애플리케이션 (React 18 + Vite)
│   ├── package.json               # vite, react, react-dom, lucide-react
│   ├── vite.config.js             # 포트 9707 바인딩 및 /api 프록시 설정
│   ├── index.html                 # 폰트 및 SPA 템플릿
│   └── src/
│       ├── main.jsx               # React 렌더링 진입점
│       ├── App.jsx                # 세션 관리, 사이드바 레이아웃, Revisit 데이터 동기화
│       ├── index.css              # 미니멀 화이트/블루 테마 및 다크모드 클래스 CSS
│       ├── components/
│       │   ├── Header.jsx         # 상단 헤더, 계정 빠른 전환, 로그아웃, 시스템 리셋
│       │   ├── SettingsNav.jsx    # 좌측 설정 네비게이션 메뉴 (6개 탭)
│       │   ├── AccountCard.jsx    # 현재 사용자 프로필 요약 배너
│       │   ├── ProfileSection.jsx # 프로필 정보(이름, 이메일, 바이오) 수정 폼
│       │   ├── ThemeSection.jsx   # 다크/라이트/시스템 테마 카드 라디오 [BUG-D07-01]
│       │   ├── LanguageSection.jsx # 언어 드롭다운 설정 [BUG-D07-02]
│       │   ├── NotificationSection.jsx # 마케팅/보안/푸시 알림 토글 스위치 [BUG-D07-03]
│       │   ├── PrivacySection.jsx # 개인정보 공개범위(전체/팀/비공개) 라디오 [BUG-D07-04]
│       │   ├── TimezoneSection.jsx # 표준 시간대 드롭다운 설정 [BUG-D07-05]
│       │   └── LoginModal.jsx     # 계정 로그아웃 및 재로그인 모달
│       └── lib/
│           └── api.js             # Fetch 기반 REST API 클라이언트
├── BUGS.md                        # STATE_REVISIT 5대 의도적 오류 상세 명세서
└── README.md                      # 프로젝트 실행 및 API 명세 문서
```

---

## 2. 포트 및 접속 URL

| 서비스 | 할당 포트 | URL | 비고 |
|--------|-----------|-----|------|
| **Frontend** | **9707** | `http://localhost:9707` | React + Vite 대시보드 |
| **Backend** | **9807** | `http://localhost:9807` | Express REST API 서버 |

- 프론트엔드 Vite 개발 서버는 `/api/*` 경로의 모든 요청을 백엔드 `http://localhost:9807/api/*`로 자동 프록시합니다.

---

## 3. 설치 및 실행 가이드

### 1) 백엔드 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-07\backend"
npm install
npm start
# 또는 node server.js
```
- 서버 기동 시 `http://localhost:9807`에서 REST API가 활성화됩니다.
- 초기 구동 시 `prefspace.db`에 6명의 테스트 계정 및 환경설정 레코드가 자동 적재됩니다.

### 2) 프론트엔드 개발 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-07\frontend"
npm install
npm run dev
```
- 브라우저에서 `http://localhost:9707`로 접속하여 환경설정 시스템을 사용할 수 있습니다.

---

## 4. 테스트 계정 목록 (DQN 학습용)

| 사용자 아이디 | 성명 | 이메일 | 역할 및 테스트 목적 |
|--------------|------|--------|---------------------|
| `user_alex` | 알렉스 김 | alex@prefspace.io | **BUG-D07-01** (다크모드 저장 후 새로고침 시 라이트모드 복원) |
| `user_sarah` | 사라 이 | sarah@prefspace.io | **BUG-D07-02** (영어 저장 후 재로그인 시 한국어 복원) |
| `user_david` | 데이비드 박 | david@prefspace.io | **BUG-D07-03** (마케팅알림 OFF 저장 후 탭 재방문 시 ON 복원) |
| `user_elena` | 엘레나 최 | elena@prefspace.io | **BUG-D07-04** (비공개 저장 후 탭 재방문 시 전체공개 복원) |
| `user_james` | 제임스 정 | james@prefspace.io | **BUG-D07-05** (뉴욕시간대 저장 후 새로고침 시 서울시간대 복원) |
| `user_normal` | 일반 테스터 | normal@prefspace.io | 모든 설정이 100% 정상 저장 및 유지되는 정상 검증 계정 |

---

## 5. REST API 엔드포인트 목록

### 시스템 & 테스트 지원
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/health` | 서버 상태 헬스 체크 |
| `POST` | `/api/test/reset` | **DB 및 사용자 환경설정을 초기 상태로 완전 복원 (멱등성)** |
| `GET` | `/api/users` | 테스트 계정 목록 조회 (빠른 전환용) |
| `POST` | `/api/auth/login` | 사용자 로그인 및 최신 세션 환경설정 반환 |

### 환경설정 & 프로필 (Preferences)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/preferences` | 현재 사용자의 최신 환경설정 조회 (Revisit 시 호출) |
| `PATCH` | `/api/preferences` | 환경설정 일괄/개별 저장 (`[BUG-D07-01 ~ 05]` 조건부 영속 누락 발현) |
| `PATCH` | `/api/profile` | 사용자 프로필(성명, 이메일, 소개글) 정보 수정 |
| `GET` | `/api/preferences/logs` | 환경설정 변경 감사 로그 조회 |

---

## 6. 의도적으로 삽입된 5개 기능 오류 요약 (STATE_REVISIT)

자세한 전/후 값 및 Evidence는 `BUGS.md`를 참조하세요.

1. **BUG-D07-01**: `user_alex`에서 다크모드 변경 저장 후 브라우저 새로고침(F5) 시 이전 라이트모드로 되돌아오는 오류.
2. **BUG-D07-02**: `user_sarah`에서 언어를 영어(en)로 변경 저장 후 로그아웃 및 재로그인 시 기존 한국어(ko)로 복구되는 오류.
3. **BUG-D07-03**: `user_david`에서 마케팅 알림을 OFF로 끄고 저장 후 다른 탭 이동 후 재방문 시 다시 ON으로 켜져 있는 오류.
4. **BUG-D07-04**: `user_elena`에서 개인정보 공개 범위를 비공개(PRIVATE)로 변경 저장 후 탭 재방문 시 전체 공개(PUBLIC)로 복원되는 오류.
5. **BUG-D07-05**: `user_james`에서 시간대를 America/New_York으로 변경 저장 후 새로고침 시 Asia/Seoul로 복구되는 오류.
