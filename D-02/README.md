# PennyLog - 스마트 개인 가계부 & 자산 관리 플랫폼 (D-02)

PennyLog는 개인 및 가계의 수입/지출을 체계적으로 기록하고, 카테고리별 예산 한도 관리 및 은행/카드 계좌 잔액을 한눈에 파악할 수 있는 금융 자산 관리 웹 애플리케이션입니다.  
본 프로젝트는 **Frontend(Next.js)**와 **Backend(Node.js + Express + SQLite)**가 독립된 폴더와 프로세스로 분리되어 구동됩니다.

---

## 1. 프로젝트 구조

```
D-02/
├── backend/                       # 백엔드 REST API 서버 (Node.js + Express + SQLite)
│   ├── .env                       # 환경변수 (포트 9802)
│   ├── package.json               # 백엔드 의존성 설정
│   ├── db.js                      # SQLite 스키마, 41개 초기 시드 데이터, reset 모듈
│   ├── server.js                  # Express API 라우트 및 의도적 오류 로직
│   └── pennylog.db                # 실제 SQLite 데이터베이스 파일
├── frontend/                      # 프론트엔드 웹 애플리케이션 (Next.js 14)
│   ├── package.json               # 프론트엔드 의존성 (Next.js, React 18, Lucide-react)
│   ├── next.config.js             # 포트 9702 설정 및 /api 백엔드 리라이트
│   └── src/
│       ├── app/
│       │   ├── globals.css        # 화이트 & 민트(Mint) 금융 플랫폼 테마 스타일
│       │   ├── layout.jsx         # 루트 레이아웃 & 메타데이터
│       │   └── page.jsx           # 메인 대시보드 및 전역 상태 관리
│       ├── components/
│       │   ├── Header.jsx         # 헤더 (월 선택, 리셋, 거래 추가)
│       │   ├── SummaryCards.jsx   # 수입/지출/저축/자산 KPI 카드
│       │   ├── CategoryChart.jsx  # 카테고리별 지출 분포 바 차트
│       │   ├── BudgetProgress.jsx # 예산 진행률 및 예산 수정 모달 연동
│       │   ├── AccountStatus.jsx  # 연결 계좌 및 잔액 현황
│       │   ├── TransactionTable.jsx # 거래 내역 필터, 검색, 수정/삭제
│       │   ├── AddTransactionModal.jsx # 수입/지출 추가 모달
│       │   ├── EditTransactionModal.jsx # 거래 수정 모달
│       │   └── EditBudgetModal.jsx      # 예산 한도 수정 모달
│       └── lib/
│           └── api.js             # API 클라이언트 모듈
├── BUGS.md                        # 의도적 기능 오류 5종 상세 명세서
└── README.md                      # 프로젝트 실행 및 API 명세 문서
```

---

## 2. 포트 및 접속 URL

| 서비스 | 할당 포트 | URL | 비고 |
|--------|-----------|-----|------|
| **Frontend** | **9702** | `http://localhost:9702` | Next.js 웹 대시보드 |
| **Backend** | **9802** | `http://localhost:9802` | Express API 서버 |

- Next.js 프론트엔드는 `/api/*` 경로의 요청을 백엔드 `http://localhost:9802/api/*`로 프록시/리라이트합니다.

---

## 3. 설치 및 실행 가이드

### 사전 요구사항
- Node.js (v18.0.0 이상)
- npm

### 1) 백엔드 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-02\backend"
npm install
npm start
# 또는 npm run dev
```
- 서버가 정상 시작되면 `http://localhost:9802`에서 REST API가 활성화됩니다.
- 초기 실행 시 `pennylog.db`에 41개의 실제 거래 내역, 13개 카테고리, 4개 계좌, 8개 월간 예산 데이터가 자동 적재됩니다.

### 2) 프론트엔드 개발 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-02\frontend"
npm install
npm run dev
```
- 브라우저에서 `http://localhost:9702`로 접속하여 대시보드를 확인할 수 있습니다.

---

## 4. REST API 엔드포인트 목록

### 시스템 & 테스트 지원
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/health` | 헬스 체크 및 서버 상태 확인 |
| `POST` | `/api/test/reset` | **DB 상태를 41개 초기 거래 및 기본 예산 상태로 완전 복원 (멱등성)** |
| `GET` | `/api/stats/monthly` | 월별 총 수입, 총 지출, 순저축액, 카테고리별 지출 비율 통계 |

### 카테고리, 계좌 및 예산
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/categories` | 전체 수입/지출 카테고리 목록 조회 |
| `GET` | `/api/accounts` | 등록된 은행/카드/페이 계좌 목록 및 잔액 조회 |
| `GET` | `/api/budgets` | 카테고리별 월간 목표 예산 목록 조회 |
| `PATCH` | `/api/budgets/:id` | 목표 예산 수정 (`id: 1` 식비 수정 시 UI 잔류 버그 발생) |

### 거래 내역 (CRUD)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/transactions` | 거래 내역 목록 조회 (필터: type, category_id, search 등) |
| `POST` | `/api/transactions` | 새 거래 등록 (`category_id: 6` 금액오류, `11` 부수입 지출오반영 발생) |
| `PATCH` | `/api/transactions/:id` | 거래 내역 수정 (`id: 8` 수정 시 `id: 7` 변경 버그 발생) |
| `DELETE` | `/api/transactions/:id` | 거래 내역 삭제 (`id: 15` 삭제 시 DB 미삭제 버그 발생) |

---

## 5. 의도적으로 삽입된 5개 기능 오류 요약 (ACTION_REPLAY)

자세한 재현 시나리오와 Evidence는 `BUGS.md`를 참조하세요.

1. **BUG-D02-01**: `교육/자기계발` (카테고리 6) 지출 등록 시 입력한 금액에 10,000원이 추가되어 저장되는 오류
2. **BUG-D02-02**: `스타벅스 커피 쿠폰 구매` (거래 ID 15) 삭제 시 성공 알림 후에도 DB/목록에 그대로 남아있는 오류
3. **BUG-D02-03**: `교보문고 도서 구매` (거래 ID 8)의 카테고리 수정 시 `올리브영 생필품 구매` (거래 ID 7)의 카테고리가 변경되는 오류
4. **BUG-D02-04**: `부수입/보너스` (카테고리 11) 수입 거래 등록 시 수입 합계 대신 지출 합계에 가산되는 오류
5. **BUG-D02-05**: `식비` (카테고리 1) 예산 수정 시 백엔드에는 정상 저장되나 프론트엔드 UI에 기존 금액(500,000원)이 계속 표시되는 오류
