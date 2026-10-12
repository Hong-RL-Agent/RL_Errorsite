# AdminScope - 엔터프라이즈 운영 관리자 대시보드 (D-05)

AdminScope는 기업 내부의 다양한 IT 인프라, 임직원 계정 및 권한, 사내 서비스 요청 결재, 그리고 정보보안 감사 로그를 한눈에 관제하고 통합 제어할 수 있는 기업용 B2B 관리자 대시보드 플랫폼입니다.

본 프로젝트는 **Frontend (React + Vite)**와 **Backend (Node.js + Express + SQLite)**가 완전히 분리된 구조로 동작하며, 실제 REST API 통신 및 멱등성 상태 리셋을 지원합니다.

---

## 1. 프로젝트 구조

```
D-05/
├── backend/                       # REST API 백엔드 서버 (Node.js + Express + SQLite)
│   ├── .env                       # 서버 환경변수 (포트 9805)
│   ├── package.json               # Express, cors, sqlite3 의존성
│   ├── db.js                      # 65명 사용자, 7개 부서, 35건 요청, 55건 로그 시드 및 리셋 모듈
│   ├── server.js                  # REST API 라우터 및 5대 SEQUENCE_REPLAY 버그 로직
│   └── adminscope.db              # SQLite 데이터베이스 파일
├── frontend/                      # 프론트엔드 SPA 웹 애플리케이션 (React + Vite)
│   ├── package.json               # React 18, Vite, Lucide-react 의존성
│   ├── vite.config.js             # 포트 9705 바인딩 및 /api 프록시 설정
│   ├── index.html                 # 메인 HTML 템플릿
│   └── src/
│       ├── main.jsx               # React 진입점
│       ├── App.jsx                # 메인 레이아웃 및 탭 라우팅
│       ├── index.css              # 다크네이비 사이드바 & 화이트 콘텐츠 모던 테마
│       ├── components/
│       │   ├── Sidebar.jsx        # 다크네이비 사이드바 메뉴
│       │   ├── Header.jsx         # 상단 헤더, 브레드크럼, 전역 시스템 리셋
│       │   ├── DashboardHome.jsx  # KPI 카드 4종, 부서별 인원 그래프, 최근 내역
│       │   ├── UserManagement.jsx # 사용자 목록, 검색, 다중 필터, 정렬, 페이지네이션
│       │   ├── UserDetailDrawer.jsx # 사용자 상세 정보 및 권한 수정 슬라이드오버
│       │   ├── RequestManagement.jsx # 서비스 요청 결재 테이블, 승인/반려 모달
│       │   ├── AuditLogs.jsx      # 관리자 활동 감사 로그 테이블 및 필터
│       │   └── ExportSection.jsx  # 조건별 통계 집계 및 CSV 내보내기 다운로드
│       └── lib/
│           └── api.js             # Fetch 기반 REST API 클라이언트
├── BUGS.md                        # SEQUENCE_REPLAY 5대 의도적 오류 상세 명세서
└── README.md                      # 프로젝트 실행 및 API 명세 문서
```

---

## 2. 포트 및 접속 URL

| 서비스 | 할당 포트 | URL | 비고 |
|--------|-----------|-----|------|
| **Frontend** | **9705** | `http://localhost:9705` | React + Vite 대시보드 |
| **Backend** | **9805** | `http://localhost:9805` | Express REST API 서버 |

- 프론트엔드 Vite 개발 서버는 `/api/*` 경로의 모든 요청을 백엔드 `http://localhost:9805/api/*`로 자동 프록시합니다.

---

## 3. 설치 및 실행 가이드

### 1) 백엔드 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-05\backend"
npm install
npm start
# 또는 node server.js
```
- 서버 기동 시 `http://localhost:9805`에서 REST API가 활성화됩니다.
- 초기 구동 시 `adminscope.db`에 65명의 사용자, 7개 부서, 35건의 서비스 결재 요청, 55건의 감사 로그가 자동 적재됩니다.

### 2) 프론트엔드 개발 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-05\frontend"
npm install
npm run dev
```
- 브라우저에서 `http://localhost:9705`로 접속하여 관리자 대시보드를 사용할 수 있습니다.

---

## 4. REST API 엔드포인트 목록

### 시스템 & 테스트 지원
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/health` | 서버 상태 헬스 체크 |
| `POST` | `/api/test/reset` | **DB 및 세션 상태를 초기 65명/7부서/35요청/55로그 상태로 완전 복원 (멱등성)** |
| `GET` | `/api/stats` | KPI 지표 (총 임직원, 활성/비활성, 대기 요청, 누적 로그, 부서별 인원) |

### 사용자 및 계정 관리 (Users)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/users` | 사용자 목록 조회 (쿼리: `search`, `status`, `department`, `sort`, `order`, `page`, `limit`) |
| `GET` | `/api/users/:id` | 사용자 단건 상세 조회 |
| `PATCH` | `/api/users/:id` | 사용자 정보 및 권한 수정 (`[BUG-D05-02]` 특정 복합필터 시 권한수정 누락) |
| `PATCH` | `/api/users/:id/status` | 계정 활성화/비활성화 (`[BUG-D05-01]`, `[BUG-D05-05]` 특정 시퀀스 시 타 계정 변조) |

### 서비스 요청 승인 (Requests)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/requests` | 서비스 요청 목록 조회 (쿼리: `status`, `department`, `type`, `search`) |
| `PATCH` | `/api/requests/:id/approve` | 서비스 요청 승인 (`[BUG-D05-03]` 특정 대기요청 승인 누락) |
| `PATCH` | `/api/requests/:id/reject` | 서비스 요청 반려 및 사유 기록 |

### 감사 로그 및 데이터 내보내기
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/logs` | 정보보안 감사 로그 조회 (쿼리: `search`, `action`, `limit`) |
| `GET` | `/api/export/csv` | 조건별 통계 CSV 다운로드 (`[BUG-D05-04]` 특정 기간/부서 시 타 부서 데이터 왜곡) |

---

## 5. 의도적으로 삽입된 5개 기능 오류 요약 (SEQUENCE_REPLAY)

자세한 재현 시퀀스와 Evidence는 `BUGS.md`를 참조하세요.

1. **BUG-D05-01**: `사용자 검색("최")` → `상태 필터("ACTIVE")` → `대상 선택(EMP-1015, 최영진_사원)` → `비활성화 클릭` 시, 선택한 계정이 아닌 전체 1번 계정(`EMP-1001`, 김도현)이 비활성화되는 오류.
2. **BUG-D05-02**: `부서 필터("플랫폼개발팀")` → `사용자 검색("강")` → `상세 패널 오픈(EMP-1018)` → `권한 수정(role="ADMIN")` → `저장` 시, 권한 변경이 무시되고 기존 `OPERATOR`로 유지되는 오류.
3. **BUG-D05-03**: `서비스 요청 목록` → `대기 필터("PENDING")` → `특정 요청 선택(REQ-2009)` → `승인 확정` 시, 성공 알림 후에도 DB 상태가 변경되지 않고 `PENDING` 상태로 남는 오류.
4. **BUG-D05-04**: `날짜 범위(2026-09-01 ~ 2026-09-30)` → `부서("마케팅팀")` → `통계 조회` → `CSV 다운로드` 시, CSV 파일에 마케팅팀이 아닌 `재무회계팀` 데이터가 왜곡되어 저장되는 오류.
5. **BUG-D05-05**: `사용자 검색("김")` → `정렬 변경(created_at asc)` → `2페이지 이동(page=2)` → `2페이지 1번째(EMP-1032, 김태희) 비활성화` 시, 2페이지 대상 대신 1페이지 1번째 대상(`EMP-1001`)이 변경되는 오류.
