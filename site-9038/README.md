# Fuzzing Agent Platform - 실증 사이트

**High-Frequency Concurrency & Race Conditions** 테마의 자율형 웹 GUI 퍼징 에이전트 훈련용 플랫폼입니다.

## 🎯 프로젝트 개요

실시간 주식/코인 거래소처럼 보이는 인터페이스를 제공하면서, 의도적으로 **동시성 관련 결함(Concurrency Bugs)**을 포함하고 있습니다. 퍼징 에이전트가 이러한 결함을 탐지하고 표현할 수 있도록 설계되었습니다.

## 🏗️ 기술 스택

### Backend
- **Framework**: Spring Boot 3.2 (Java 21)
- **Database**: H2 (In-Memory)
- **Port**: 9029
- **Build**: Maven

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Port**: 5173

## 🐛 포함된 결함 (Intentional Faults)

### Index 160: Race Condition (동시 출금)
**문제**: 동시에 두 번의 출금 요청 시 잔액 검증 로직이 꼬여 마이너스 잔액이 발생

**위치**: `TradingService.withdraw()`
- 잔액 확인 → 의도적 지연(50ms) → 출금 처리
- 다른 요청이 이 사이에 개입 가능

**테스트 방법**:
```bash
# 동일 사용자에서 빠르게 5개의 출금 요청
POST /api/trading/withdraw
{ "userId": 1, "amount": 50000 }
```

### Index 165: Atomic Failure (원자성 위반)
**문제**: 포인트 차감과 아이템 지급이 원자적으로 처리되지 않아 한쪽만 성공할 수 있음

**위치**: `TradingService.buyItem()`
- 포인트 차감 성공 (30ms 지연)
- 다른 요청 개입 가능
- 아이템 지급 실패 시 포인트는 이미 차감됨

**테스트 방법**:
```bash
POST /api/trading/buy-item
{ "userId": 1, "itemName": "Gold Coin", "quantity": 10, "pointCost": 500 }
```

### Index 175: Thread Starvation (요청 무한 지연)
**문제**: 특정 유저의 요청이 영원히 처리되지 않는 현상

**위치**: `TradingService.withdraw()` + `USER_STARVATION_LOCK`
- 특정 유저에 대해 Starvation Lock 활성화 시 모든 요청이 무한 대기

**테스트 방법**:
```bash
# Starvation 활성화
POST /api/trading/trigger-starvation/1

# 이후 모든 거래 요청이 무한 대기
POST /api/trading/withdraw

# Starvation 해제
POST /api/trading/release-starvation/1
```

## 📁 프로젝트 구조

```
site-9038/
├── backend/
│   ├── pom.xml
│   ├── src/main/
│   │   ├── java/com/fuzzing/agent/
│   │   │   ├── FuzzingAgentApplication.java
│   │   │   ├── controller/     # REST API 컨트롤러
│   │   │   ├── service/        # 비즈니스 로직 (결함 포함)
│   │   │   ├── domain/         # JPA 엔티티
│   │   │   └── repository/     # 데이터 접근 계층
│   │   └── resources/
│   │       └── application.yml
│   └── src/test/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx    # 자산 요약 대시보드
│   │       ├── ChartPage.jsx    # 실시간 차트
│   │       └── Trading.jsx      # 거래 UI
│   └── public/
└── README.md
```

## 🚀 실행 방법

### 1. 백엔드 실행

```bash
cd backend
mvn clean spring-boot:run
# 또는
mvn compile
mvn spring-boot:run
```

서버는 `http://localhost:9029`에서 실행됩니다.

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:5173`에서 실행됩니다.

## 📡 API 문서

### 사용자 관리

#### 회원가입
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "trader_1",
  "email": "trader@example.com",
  "nickname": "Test Trader"
}
```

**응답**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "trader_1",
    "email": "trader@example.com",
    "nickname": "Test Trader"
  }
}
```

#### 사용자 조회
```http
GET /api/users/{id}
GET /api/users/username/{username}
```

### 거래 관리

#### 대시보드 조회
```http
GET /api/trading/dashboard/{userId}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "account": {
      "id": 1,
      "balance": "100000.00",
      "points": "5000.00"
    },
    "transactions": [ ... ],
    "items": [ ... ],
    "assetValue": "150000.00"
  }
}
```

#### 출금 (Race Condition 테스트)
```http
POST /api/trading/withdraw
Content-Type: application/json

{
  "userId": 1,
  "amount": 50000
}
```

#### 입금
```http
POST /api/trading/deposit
Content-Type: application/json

{
  "userId": 1,
  "amount": 100000
}
```

#### 아이템 구매 (Atomic Failure 테스트)
```http
POST /api/trading/buy-item
Content-Type: application/json

{
  "userId": 1,
  "itemName": "Gold Coin",
  "quantity": 10,
  "pointCost": 500
}
```

#### Thread Starvation 테스트
```http
POST /api/trading/trigger-starvation/{userId}
POST /api/trading/release-starvation/{userId}
```

## 🧪 테스트 시나리오

### Race Condition 테스트 (Index 160)

**목표**: 동시 출금으로 마이너스 잔액 유발

**명령어**:
```bash
# 터미널 1
curl -X POST http://localhost:9029/api/trading/withdraw \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 50000}'

# 터미널 2 (거의 동시에)
curl -X POST http://localhost:9029/api/trading/withdraw \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 50000}'

# 또는 프론트엔드의 "Race Condition 테스트" 버튼 클릭
```

**예상 결과**: 잔액이 음수가 되거나, 출금이 중복 처리될 수 있음

### Atomic Failure 테스트 (Index 165)

**목표**: 포인트 차감 후 아이템 지급 실패

**명령어**:
```bash
curl -X POST http://localhost:9029/api/trading/buy-item \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "itemName": "Gold Coin", "quantity": 10, "pointCost": 5000}'
```

**예상 결과**: 포인트는 차감되었으나 아이템이 지급되지 않을 수 있음

### Thread Starvation 테스트 (Index 175)

**목표**: 특정 유저의 모든 요청이 무한 대기

**명령어**:
```bash
# Starvation 활성화
curl -X POST http://localhost:9029/api/trading/trigger-starvation/1

# 이 요청은 응답이 없을 것
curl -X POST http://localhost:9029/api/trading/withdraw \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 10000}'

# Starvation 해제
curl -X POST http://localhost:9029/api/trading/release-starvation/1
```

## 🎨 UI 특징

- **다크 테마**: #0a0e27 배경색을 사용한 전문적인 거래소 디자인
- **반응형**: 모바일, 태블릿, 데스크톱 지원 (max-w-[1440px])
- **실시간 업데이트**: 2초마다 대시보드 새로고침
- **차트**: 실시간 가격 변동 시뮬레이션
- **Glassmorphism**: 현대적인 UI 효과

## 🔄 CORS 설정

백엔드는 모든 오리진(`*`)에서의 요청을 허용하도록 설정되어 있습니다:

```java
@CrossOrigin(origins = "*")
@SpringBootApplication
public class FuzzingAgentApplication { }
```

## 📊 데이터베이스 스키마

### Users Table
- `id` (PK, AUTO_INCREMENT)
- `username` (UNIQUE)
- `email`
- `nickname`
- `version` (optimistic locking)

### Accounts Table
- `id` (PK)
- `user_id` (FK)
- `balance` (DECIMAL)
- `points` (DECIMAL)

### Transactions Table
- `id` (PK)
- `user_id` (FK)
- `type` (ENUM: WITHDRAW, DEPOSIT, BUY_ITEM)
- `amount` (DECIMAL)
- `status` (ENUM: PENDING, SUCCESS, FAILED)
- `created_at` (TIMESTAMP)

### Items Table
- `id` (PK)
- `user_id` (FK)
- `itemName`
- `quantity`
- `acquiredAt` (TIMESTAMP)

## 🛠️ 문제 해결

### 포트 충돌
```bash
# 백엔드 포트 확인
lsof -i :9029

# 프론트엔드 포트 확인
lsof -i :5173
```

### Maven 빌드 실패
```bash
cd backend
mvn clean install
```

### 데이터베이스 초기화
애플리케이션 시작 시 자동으로 `create-drop` 정책으로 초기화됩니다.

## 📝 라이센스

이 프로젝트는 교육 및 퍼징 에이전트 훈련용으로만 사용됩니다.

## 📧 문의

기술적 문제나 개선 사항은 이슈 트래커에 보고해주세요.
