# site056 — AutoCheck 중고차 점검·예약 플랫폼

AutoCheck는 중고차 구매자가 차량 정보를 투명하게 확인하고, 국가 공인 정비기능장의 120가지 정밀 진단 서비스를 예약하며, 실시간 점검 리포트를 조회할 수 있는 독립형 중고차 점검·방문 예약 플랫폼 서비스입니다.

---

## 1. 기술 스택

- **Frontend**: React 18, Vite 5, Lucide Icons, Vanilla CSS (Design Tokens & Glassmorphism)
- **Backend**: Node.js, Express 4, In-Memory Mock Database
- **Port**: `9955`
- **Architecture**: Single Page Application (SPA) with Express API Server & Production Static Hosting

---

## 2. 주요 기능 및 페이지 구성

| 페이지 | 설명 | 주요 기능 |
|---|---|---|
| **홈 (`Home`)** | 서비스 소개 및 추천 검증 매물 | 빠른 차량 검색, 추천 매물 카드, 3대 서비스 혜택 |
| **차량 찾기 (`Vehicles`)** | 전체 점검 매물 검색 및 필터 | 제조사/모델/지역/가격 필터, 통합 검색, 관심 차량 등록 |
| **차량 상세 (`VehicleDetail`)** | 차량 종합 정보 및 진단 요약 | 상세 스펙, 사고 이력, 소유자 변경, 리포트 바로가기 |
| **점검 예약 (`Booking`)** | 4단계 원스톱 점검 예약 | 차량 선택 → 센터 선택 → 날짜/시간 선택 → 예약 정보 입력 |
| **내 예약 (`MyBookings`)** | 고객 예약 상태 관리 | 예정/완료/취소 예약 목록, 예약 상세, 예약 취소 |
| **점검 리포트 (`Report`)** | 120개 항목 정밀진단 결과서 | 종합 점수, 8대 핵심 진단, 정비 권장사항, 서류/사진 첨부 |
| **관심 차량 (`Favorites`)** | 찜한 차량 모아보기 | 북마크 차량 관리 및 원클릭 예약 연결 |

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
> 서버가 실행되면 브라우저에서 `http://localhost:9955`로 접속할 수 있습니다.

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
| `GET` | `/api/health` | 서버 헬스체크 |
| `GET` | `/api/vehicles` | 차량 목록 조회 (검색/필터 지원) |
| `GET` | `/api/vehicles/:id` | 차량 상세 정보 조회 |
| `GET` | `/api/centers` | 점검 센터 목록 조회 |
| `GET` | `/api/centers/:id` | 점검 센터 상세 조회 |
| `GET` | `/api/availability` | 센터/일자별 예약 가능 시간 조회 |
| `GET` | `/api/bookings` | 예약 목록 조회 |
| `GET` | `/api/bookings/:id` | 예약 상세 내역 조회 |
| `POST` | `/api/bookings` | 신규 점검 예약 생성 |
| `DELETE`| `/api/bookings/:id` | 점검 예약 취소 (204 No Content) |
| `GET` | `/api/reports` | 완료된 점검 리포트 목록 조회 |
| `GET` | `/api/reports/:id` | 점검 리포트 상세 조회 |
| `POST` | `/api/reports/:reportId/documents` | 점검 서류 및 사진 파일 등록 |
| `GET` | `/api/favorites` | 관심 등록 차량 목록 |
| `POST` | `/api/favorites/:vehicleId` | 관심 차량 추가 |
| `DELETE`| `/api/favorites/:vehicleId` | 관심 차량 삭제 |

---

## 5. Mock Data 구조

- **Vehicles (12종)**: 현대 그랜저, 기아 K5, 현대 아반떼, 제네시스 G80, 기아 쏘렌토, 현대 투싼, 제네시스 GV70, 카니발, 아이오닉 5, EV6, BMW 5시리즈, 벤츠 E-클래스
- **Centers (5개소)**: AutoCheck 강남센터, 수원센터(도이치오토월드), 분당센터, 인천센터(M파크), 일산센터
- **Bookings (4건+)**: 예정/완료/취소 상태가 포함된 실시간 예약 데이터
- **Reports (6건)**: 종합 점수, 8대 핵심 점검 분야(엔진, 변속기, 브레이크, 타이어, 하부, 전장, 외관, 골격), 정비 권장사항 및 첨부 문서
- **Documents**: 차량정밀점검확인서, OBD2 진단 데이터 로그, 하부 고해상도 촬영 사진 등
