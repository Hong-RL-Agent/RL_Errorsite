# OrderPilot - 이커머스 통합 주문 및 배송 관리 시스템 (D-06)

OrderPilot은 온라인 쇼핑몰 운영자가 일별 신규 주문 접수부터 결제 승인, 배송 준비 및 운송장 번호 등록, 고객 클레임(취소/환불) 처리를 한곳에서 신속하게 처리할 수 있는 실제 전자상거래 백오피스 관리 시스템입니다.

본 프로젝트는 **Frontend (Next.js 14)**와 **Backend (Node.js + Express + SQLite)**가 독립된 프로세스로 실행되며 실제 REST API 통신 및 멱등성 데이터 리셋을 지원합니다.

---

## 1. 프로젝트 구조

```
D-06/
├── backend/                       # REST API 백엔드 서버 (Express + SQLite)
│   ├── .env                       # 서버 환경변수 (포트 9806)
│   ├── package.json               # express, sqlite3, cors, dotenv 의존성
│   ├── db.js                      # 초기 주문 75건, 고객 25명, 품목, 로그 시드 및 멱등 리셋 함수
│   ├── server.js                  # Express REST API 라우터 및 5대 SEQUENCE_REPLAY 버그 로직
│   └── orderpilot.db              # SQLite 데이터베이스 파일
├── frontend/                      # 프론트엔드 웹 애플리케이션 (Next.js 14)
│   ├── package.json               # next, react, react-dom, lucide-react
│   ├── next.config.js             # 포트 9706 설정 및 /api 프록시 리라이트
│   └── src/
│       ├── app/
│       │   ├── globals.css        # 화이트 & 오렌지 이커머스 백오피스 테마 CSS
│       │   ├── layout.jsx         # 루트 레이아웃 & 메타데이터
│       │   └── page.jsx           # 메인 대시보드 및 전역 상태 관리
│       ├── components/
│       │   ├── Header.jsx         # 상단 헤더, 로고, 데이터 초기화 버튼
│       │   ├── StatCards.jsx      # 누적 주문, 결제완료, 배송준비, 배송중, 환불요청, 총매출 KPI
│       │   ├── OrderFilterBar.jsx # 주문번호/고객 검색, 기간 범위, 결제/배송 필터, 정렬
│       │   ├── OrderTable.jsx     # 주문 목록 테이블, 상태 배지, 페이지네이션
│       │   ├── OrderDetailModal.jsx # 주문 상세 모달, 품목 수량 수정, 총액 표시, 타임라인
│       │   ├── DeliveryStatusModal.jsx # 배송 상태 변경 및 택배사/운송장 번호 등록 모달
│       │   ├── CancelOrderModal.jsx # 주문 취소 사유 입력 및 취소 확정 모달
│       │   ├── RefundApproveModal.jsx # 환불 요청 건 승인 처리 모달
│       │   └── CustomerListModal.jsx # 25명 고객 목록 및 누적 주문 내역 모달
│       └── lib/
│           └── api.js             # REST API 비동기 클라이언트
├── BUGS.md                        # SEQUENCE_REPLAY 5대 의도적 기능 오류 상세 명세서
└── README.md                      # 프로젝트 실행 및 API 명세 가이드
```

---

## 2. 포트 및 접속 URL

| 서비스 | 할당 포트 | URL | 비고 |
|--------|-----------|-----|------|
| **Frontend** | **9706** | `http://localhost:9706` | Next.js 이커머스 대시보드 |
| **Backend** | **9806** | `http://localhost:9806` | Express REST API 서버 |

- Next.js 프론트엔드는 `/api/*` 요청을 백엔드 `http://localhost:9806/api/*`로 자동 프록시/리라이트합니다.

---

## 3. 설치 및 실행 가이드

### 1) 백엔드 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-06\backend"
npm install
npm start
# 또는 node server.js
```
- 서버가 실행되면 `http://localhost:9806`에서 REST API가 활성화됩니다.
- 초기 구동 시 `orderpilot.db`에 75건의 주문, 25명의 고객 회원, 품목 및 타임라인 로그가 자동 적재됩니다.

### 2) 프론트엔드 개발 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-06\frontend"
npm install
npm run dev
```
- 브라우저에서 `http://localhost:9706`으로 접속하여 주문 관리 시스템을 사용할 수 있습니다.

---

## 4. REST API 엔드포인트 목록

### 시스템 & 테스트 지원
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/health` | 서버 상태 헬스 체크 |
| `POST` | `/api/test/reset` | **DB 및 세션 상태를 초기 75건 주문 / 25명 고객 상태로 완전 복원 (멱등성)** |
| `GET` | `/api/stats` | 주문 현황 KPI 지표 (총 주문 수, 결제완료, 배송준비, 배송중, 환불요청, 총매출액) |

### 주문 관리 (Orders)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/orders` | 주문 목록 조회 (쿼리: `search`, `startDate`, `endDate`, `paymentStatus`, `deliveryStatus`, `sort`, `order`, `page`, `limit`) |
| `GET` | `/api/orders/:id` | 주문 상세 정보, 품목 목록, 타임라인 로그 조회 |
| `PATCH` | `/api/orders/:id/delivery` | 배송 상태 변경 및 운송장 번호 등록 (`[BUG-D06-01]`, `[BUG-D06-03]`) |
| `PATCH` | `/api/orders/:id/items` | 주문 품목 수량 수정 및 총액 저장 (`[BUG-D06-02]`) |
| `PATCH` | `/api/orders/:id/cancel` | 주문 취소 처리 및 취소 사유 기록 (`[BUG-D06-04]`) |
| `PATCH` | `/api/orders/:id/refund-approve` | 환불 승인 처리 (`[BUG-D06-05]`) |
| `GET` | `/api/orders/:id/logs` | 주문 처리 이력 타임라인 조회 |

### 고객 관리 (Customers)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/customers` | 등록 고객 25명 목록 및 누적 주문 횟수, 등급 조회 |

---

## 5. 의도적으로 삽입된 5개 기능 오류 요약 (SEQUENCE_REPLAY)

자세한 재현 시퀀스와 증거 데이터는 `BUGS.md`를 참조하세요.

1. **BUG-D06-01**: `날짜 검색(2026-10-01~10-10)` → `결제 완료 필터(PAID)` → `주문 선택(ORD-20261005-0012)` → `배송 준비 처리` 시, 배송 상태가 변경되지 않고 `배송 대기(PENDING)`로 잔류하는 오류.
2. **BUG-D06-02**: `주문 검색(김민준)` → `상세 페이지 열기(ORD-20261008-0025)` → `수량 변경(1개->3개)` → `저장` 시, 총액이 267,000원이 아닌 89,000원으로 왜곡 저장되는 오류.
3. **BUG-D06-03**: `배송 중 필터(SHIPPING)` → `주문 선택(ORD-20261003-0008)` → `운송장 입력` → `배송 완료 처리` 시, 운송장 정보가 다른 주문(`ORD-20261003-0007`)에 저장되는 오류.
4. **BUG-D06-04**: `고객명 검색(정다은)` → `주문 선택(ORD-20261007-0019)` → `취소 사유 입력` → `취소 확정` 시, 취소 성공 메시지가 나오지만 주문은 계속 결제 완료(PAID) 상태인 오류.
5. **BUG-D06-05**: `환불 요청 필터(REFUND_REQUESTED)` → `특정 주문 선택(ORD-20261004-0010)` → `환불 승인` 시, 선택한 주문 대신 다른 주문(`ORD-20261002-0005`)의 결제 상태가 환불 완료로 변경되는 오류.
