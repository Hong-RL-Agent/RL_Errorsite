# site058 — FreshLaundry 세탁 수거·배송 플랫폼

FreshLaundry는 사용자가 집에서 간편하게 세탁물을 수거 요청하고, 최첨단 친환경 스마트팩토리에서 정밀 세탁된 의류를 약속된 새벽에 문 앞으로 배송받는 독립형 비대면 세탁 O2O 플랫폼입니다.

---

## 1. 기술 스택

- **Frontend**: React 18, Vite 5, Lucide Icons, Vanilla CSS (Design Tokens & Responsive Glassmorphism)
- **Backend**: Node.js, Express 4, In-Memory Mock Database
- **Port**: `9957`
- **Architecture**: Single Page Application (SPA) with Express API Server & Production Static Hosting

---

## 2. 주요 기능 및 페이지 구성

| 페이지 | 설명 | 주요 기능 |
|---|---|---|
| **홈 (`Home`)** | 서비스 소개 및 추천 프로그램 | 6대 인기 세탁 프로그램, 3단계 이용 절차 가이드, 빠른 신청 CTA |
| **서비스 안내 (`Services`)** | 8대 맞춤 세탁 정찰제 요금표 | 품목별 정찰제 단가표, 섬유별 맞춤 세탁 공정 안내 |
| **세탁 신청 (`NewOrder`)** | 4단계 원스톱 비대면 수거 예약 | 서비스 선택 → 품목/수량 지정 → 주소 선택 → 수거 일정/시간대 지정 |
| **주문 내역 (`Orders`)** | 신청 주문 상태별 목록 관리 | 수거 예정, 세탁 중, 검수 중, 배송 중, 배송 완료 필터링 조회 |
| **주문 상세 (`OrderDetail`)** | 실시간 공정 및 배송 관제 | 세탁 6단계 타임라인, 실시간 배송 관제, 세탁 전 사진 등록, 영수증 미리보기 |
| **마이페이지 (`Account`)** | 고객 프로필 및 수거 주소록 | 수거지 주소록 추가/관리, FreshPay 결제 카드, 세탁 케어 옵션 설정 |

---

## 3. 설치 및 실행 방법

### 패키지 설치
```bash
npm install
```

### 프로덕션 서버 실행 (권장)
```bash
npm start
```
> 서버가 실행되면 브라우저에서 `http://localhost:9957`로 접속할 수 있습니다.

### 개발 모드 (Frontend Dev Server)
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

---

## 4. 백엔드 API 명세

| Method | Endpoint | 설명 |
|---|---|---|
| `GET` | `/api/health` | 서버 상태 점검 |
| `GET` | `/api/services` | 세탁 서비스 카테고리 목록 |
| `GET` | `/api/services/:id` | 특정 서비스 상세 정보 |
| `GET` | `/api/laundry-items` | 세탁 품목 및 정찰제 요금 목록 |
| `GET` | `/api/addresses` | 등록 수거 주소록 목록 |
| `POST` | `/api/addresses` | 신규 수거 주소 등록 |
| `GET` | `/api/pickup-slots` | 수거 가능 시간대 슬롯 목록 |
| `GET` | `/api/delivery-slots` | 배송 희망 시간대 슬롯 목록 |
| `GET` | `/api/orders` | 주문 전체 목록 조회 |
| `GET` | `/api/orders/:id` | 주문 기본 정보 상세 조회 |
| `POST` | `/api/orders` | 신규 세탁 수거 주문 생성 |
| `PATCH`| `/api/orders/:id` | 주문 상태 갱신 |
| `GET` | `/api/orders/:id/items` | 주문 세탁물 품목 상세 조회 |
| `GET` | `/api/orders/:id/delivery` | 주문 실시간 배송 관제 정보 |
| `GET` | `/api/orders/:id/status` | 주문 실시간 상태 조회 (ETag 지원) |
| `POST` | `/api/orders/:orderId/items/photo` | 세탁물 사진 업로드 (멀티파트) |
| `GET` | `/api/orders/:id/receipt` | 전자 세탁 영수증 미리보기 (Range 지원) |

---

## 5. Mock Data 구조

- **Services (8종)**: 일반 생활세탁, 셔츠 & 정장 세탁, 이불 & 침구류 세탁, 운동화 & 신발 케어, 프리미엄 드라이클리닝, 패딩 & 아웃도어 특수세탁, 가죽 & 모피 전문 케어, 커튼 & 대형 패브릭
- **Laundry Items (11종)**: 와이셔츠, 정장 자켓, 정장 슬랙스, 티셔츠, 니트/가디건, 롱코트, 롱패딩, 차렵이불, 운동화, 스니커즈, 가죽자켓
- **Orders (6건+)**: 수거 예정, 세탁 중, 검수 중, 배송 중, 배송 완료 등 다양한 라이프사이클의 주문
- **Addresses (3건)**: 우리집(기본배송지), 회사/사무실, 부모님 댁
