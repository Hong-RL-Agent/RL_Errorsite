# SubFlow - SaaS 구독 및 지출 통합 관리 플랫폼 (D-01)

SubFlow는 엔터프라이즈 및 스타트업 팀을 위한 실시간 SaaS 구독 통합 관리 및 지출 최적화 웹 애플리케이션입니다.  
본 프로젝트는 **Frontend(React + Vite)**와 **Backend(Node.js + Express + SQLite)**가 완전히 분리되어 독립적으로 동작합니다.

---

## 1. 프로젝트 구조

```
D-01/
├── backend/                  # 백엔드 API 서버 (Node.js + Express + SQLite)
│   ├── .env                  # 환경 변수 (포트 9801)
│   ├── db.js                 # SQLite 데이터베이스 스키마, 시드 데이터, 리셋 모듈
│   ├── package.json          # 백엔드 의존성 설정
│   ├── server.js             # Express 서버 및 RESTful API 구현
│   └── subflow.db            # 실제 SQLite 데이터베이스 파일
├── frontend/                 # 프론트엔드 웹 애플리케이션 (React + Vite)
│   ├── index.html            # 메인 HTML 템플릿
│   ├── package.json          # 프론트엔드 의존성 설정
│   ├── vite.config.js        # Vite 설정 (포트 9701, /api 백엔드 프록시)
│   └── src/
│       ├── api.js            # 백엔드 API 클라이언트
│       ├── App.jsx           # 메인 애플리케이션 및 상태 관리
│       ├── index.css         # 네이비 & 보라색 현대적 다크 대시보드 스타일링
│       ├── main.jsx          # React 렌더링 엔트리포인트
│       └── components/       # UI 컴포넌트
│           ├── Sidebar.jsx   # 네비게이션 및 테스트 리셋 버튼
│           ├── Navbar.jsx    # 상단 검색창, 알림 벨, 프로필
│           ├── DashboardView.jsx        # KPI 지표 카드, 월간 지출 차트
│           ├── SubscriptionsView.jsx    # 구독 관리 테이블, 자동결제 스위치
│           ├── CatalogView.jsx          # 신규 서비스 탐색 & 구독 신청
│           ├── BillingView.jsx          # 결제 내역 및 인보이스 관리
│           ├── PlansView.jsx            # SaaS 요금제 비교 화면
│           ├── DetailModal.jsx          # 구독 상세 설정 모달
│           ├── ConfirmModal.jsx         # 해지 확인 모달
│           └── NotificationModal.jsx    # 알림 센터 모달
├── BUGS.md                   # 의도적으로 삽입된 5개 오류 명세서
└── README.md                 # 프로젝트 문서 및 실행 가이드
```

---

## 2. 포트 및 접속 URL

| 서비스 | 할당 포트 | URL | 비고 |
|--------|-----------|-----|------|
| **Frontend** | **9701** | `http://localhost:9701` | React + Vite 대시보드 |
| **Backend** | **9801** | `http://localhost:9801` | Express API 서버 |

- 프론트엔드 개발 서버는 `/api` 요청을 `http://localhost:9801`로 자동 프록시합니다.

---

## 3. 설치 및 실행 방법

### 사전 요구사항
- Node.js (v18.0.0 이상 권장)
- npm

### 1) 백엔드 설치 및 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-01\backend"
npm install
npm start
# 또는 npm run dev
```
- 서버가 정상 구동되면 `http://localhost:9801`에서 API가 활성화됩니다.
- 초기 구동 시 `subflow.db`에 기본 시드 데이터가 자동 적재됩니다.

### 2) 프론트엔드 설치 및 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-01\frontend"
npm install
npm run dev
```
- 브라우저에서 `http://localhost:9701`로 접속합니다.

---

## 4. 백엔드 REST API 목록

### 공통 & 테스트 지원
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/health` | 서버 상태 및 헬스 체크 |
| `POST` | `/api/test/reset` | **DB 상태를 초기 시드 데이터로 복원 (멱등성 보장)** |
| `GET` | `/api/analytics` | 대시보드용 주요 KPI 및 월별 지출 통계 |

### 서비스 카탈로그 & 구독 관리
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/catalog` | 구독 가능한 서비스 카탈로그 목록 조회 |
| `GET` | `/api/subscriptions` | 현재 구독 서비스 목록 조회 (쿼리: status, search, cycle) |
| `POST` | `/api/subscriptions` | 신규 구독 신청 (`service_id: 5`일 때 2건 생성 버그 발생) |
| `PATCH` | `/api/subscriptions/:id/plan` | 구독 요금제/주기 변경 (`id: 1`일 때 DB 미반영 버그 발생) |
| `PATCH` | `/api/subscriptions/:id/auto-renew` | 자동 결제 ON/OFF 설정 |
| `POST` | `/api/subscriptions/:id/cancel` | 구독 해지 신청 (`id: 2`일 때 ACTIVE 유지 버그 발생) |

### 결제 내역 & 인보이스
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/billings` | 결제 내역 및 인보이스 목록 조회 |
| `DELETE` | `/api/billings/:id` | 결제 내역 삭제 (`id: 4` 삭제 시 `id: 3` 삭제 버그 발생) |

### 알림 센터
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/notifications` | 시스템 알림 목록 조회 |
| `PATCH` | `/api/notifications/:id/read` | 특정 알림 읽음 처리 |

---

## 5. 의도적으로 삽입된 5개 기능 오류 요약

자세한 재현 절차, 트리거 및 검증 방법은 `BUGS.md`를 참고하세요.

1. **BUG-D01-01**: `Slack` (ID: 2) 구독 해지 완료 후에도 `ACTIVE` 상태가 유지되는 오류
2. **BUG-D01-02**: `Notion` (ID: 1) 요금제를 상위 플랜으로 변경 시 성공 응답 후 실제 DB는 기존 플랜(`Plus`)이 유지되는 오류
3. **BUG-D01-03**: `GitHub Copilot` (ID: 3)의 자동결제를 OFF로 변경 시 백엔드에는 저장되지만 프론트엔드 스위치가 여전히 ON으로 표시되는 오류
4. **BUG-D01-04**: 결제 내역에서 `AWS Cloud Services` (ID: 4) 삭제 클릭 시 `GitHub Copilot` (ID: 3)이 삭제되는 오류
5. **BUG-D01-05**: 카탈로그에서 `Figma Professional` (ID: 5) 구독 신청 시 동일 구독 레코드가 2회 중복 생성되는 오류
