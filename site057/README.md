# site057 — RideOn 공유 모빌리티 대여 플랫폼

RideOn은 도심 속에서 가까운 전기자전거와 전동킥보드를 실시간으로 탐색하고 간편하게 대여하며, 주행 시간·요금 및 이용 내역을 관리할 수 있는 독립형 스마트 공유 모빌리티 서비스 플랫폼입니다.

---

## 1. 기술 스택

- **Frontend**: React 18, Vite 5, Lucide Icons, Vanilla CSS (Design Tokens & Glassmorphism)
- **Backend**: Node.js, Express 4, In-Memory Mock Database
- **Port**: `9956`
- **Architecture**: Single Page Application (SPA) with Express API Server & Production Static Hosting

---

## 2. 주요 기능 및 페이지 구성

| 페이지 | 설명 | 주요 기능 |
|---|---|---|
| **홈 (`Home`)** | 서비스 소개 및 추천 모빌리티 | 실시간 거치대 맵, 추천 인기 기기, 에코 리워드 안내 |
| **주변 차량 (`Nearby`)** | 주변 전기자전거/킥보드 탐색 | 거리/배터리 정렬, 차량 종류 필터, 스테이션별 차량 조회 |
| **차량 상세 (`VehicleDetail`)** | 기기 제원 및 안전 상태 | 배터리 잔량, 주행 가능 거리, 요금 체계, 브레이크 점검일 |
| **대여 관리 (`Rental`)** | 실시간 주행 타이머 및 반납 | 실시간 주행 세션, 경과 시간 카운트, 실시간 예상 요금, 반납 |
| **이용 기록 (`History`)** | 과거 라이딩 이력 및 영수증 | 주행 날짜, 탑승 시간, 이동 거리, 요금 상세 내역 영수증 |
| **내 계정 (`Account`)** | 라이더 프로필 및 안전 인증 | 멤버십 등급, 보유 크레딧, 탄소 절감량, 자동 결제 관리 |

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
> 서버가 실행되면 브라우저에서 `http://localhost:9956`으로 접속할 수 있습니다.

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
| `GET` | `/api/vehicles` | 전체 차량 목록 조회 (필터/정렬 지원) |
| `GET` | `/api/vehicles/:id` | 특정 차량 상세 조회 |
| `GET` | `/api/stations` | 전체 스테이션 목록 조회 |
| `GET` | `/api/stations/:id` | 특정 스테이션 상세 및 거치 차량 조회 |
| `GET` | `/api/vehicles/:id/availability`| 차량 대여 가능 상태 확인 |
| `GET` | `/api/rentals` | 전체 대여 목록 조회 |
| `GET` | `/api/rentals/:id` | 특정 대여 상세 조회 |
| `GET` | `/api/rentals/:id/fare` | 대여 요금 상세 계산 |
| `POST` | `/api/rentals` | 신규 대여 세션 생성 |
| `POST` | `/api/rentals/:id/start` | 기기 잠금해제 및 주행 시작 |
| `POST` | `/api/rentals/:id/finish` | 기기 반납 및 이용 종료 |
| `GET` | `/api/rides/history` | 과거 이용 기록 목록 조회 |
| `GET` | `/api/account` | 사용자 프로필 및 크레딧 조회 |
| `PATCH`| `/api/account` | 사용자 프로필 및 결제 설정 수정 |

---

## 5. Mock Data 구조

- **Vehicles (15종+)**: RideOn Bike 102, 118, 205, 220, 241, 501, 604, 702 (전기자전거) 및 RideOn Scooter 301, 317, 325, 412, 428, 512, 619 (전동킥보드)
- **Stations (10개소)**: 강남역 11번 출구, 역삼역 포스코타워, 선릉역 1번 출구, 삼성역 코엑스, 신논현역, 양재역, 잠실역, 판교역, 성수역, 여의도역
- **Rentals (3건+)**: 진행 중(active), 완료(completed), 누락 데이터 등 다양한 상태의 대여 건
- **Ride History (8건+)**: 거리, 시간, 요금, 출발/도착지가 포함된 주행 기록 데이터
- **Account**: 김라이더 (그린 패스 멤버), 보유 크레딧 24,500P, 탄소 절감량 16.2kg
