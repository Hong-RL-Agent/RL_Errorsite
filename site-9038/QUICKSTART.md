# 빠른 시작 가이드

## 📦 필수 요구사항

- **Java 21+** (OpenJDK 권장)
- **Node.js 18+** (npm 포함)
- **Maven 3.8+**

## 🚀 한 번에 실행하기

### 방법 1: 각 터미널에서 실행

#### 터미널 1 - 백엔드
```bash
cd backend
mvn clean spring-boot:run
```

#### 터미널 2 - 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

#### 브라우저에서 접속
```
http://localhost:5173
```

---

## 🧪 빠른 테스트

### 1. Race Condition 테스트 (Index 160)

**방법 A: 프론트엔드 UI 사용**
1. 대시보드 접속 → "거래" 탭
2. 출금 금액: 50000 입력
3. "Race Condition 테스트 (출금 x5)" 버튼 클릭
4. 최종 잔액이 음수가 되는지 확인

**방법 B: curl 사용**
```bash
# 5개의 요청을 동시에 발송
for i in {1..5}; do
  curl -X POST http://localhost:9029/api/trading/withdraw \
    -H "Content-Type: application/json" \
    -d '{"userId": 1, "amount": 50000}' &
done
wait

# 대시보드 확인
curl http://localhost:9029/api/trading/dashboard/1 | jq '.data.account.balance'
```

### 2. Atomic Failure 테스트 (Index 165)

**curl 사용**:
```bash
# 동시에 2개 아이템 구매
curl -X POST http://localhost:9029/api/trading/buy-item \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "itemName": "Gold Coin", "quantity": 10, "pointCost": 500}' &

curl -X POST http://localhost:9029/api/trading/buy-item \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "itemName": "Silver Coin", "quantity": 5, "pointCost": 300}' &

wait

# 결과 확인 (포인트는 차감되었지만 아이템이 일부만 지급될 수 있음)
curl http://localhost:9029/api/trading/dashboard/1 | jq '.data | {points, items_count: (.items | length)}'
```

### 3. Thread Starvation 테스트 (Index 175)

```bash
# 1. Starvation 활성화
curl -X POST http://localhost:9029/api/trading/trigger-starvation/1

# 2. 이 요청은 타임아웃 (응답 없음)
timeout 5 curl -X POST http://localhost:9029/api/trading/withdraw \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 10000}'
# 결과: Command 'curl' timed out

# 3. Starvation 해제
curl -X POST http://localhost:9029/api/trading/release-starvation/1

# 4. 이제 정상 응답
curl -X POST http://localhost:9029/api/trading/withdraw \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 10000}'
```

---

## 🔧 개발 팁

### 백엔드 재빌드
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

### 프론트엔드 재시작
```bash
cd frontend
npm run dev
```

### 데이터 초기화
백엔드를 재시작하면 H2 데이터베이스가 자동으로 초기화됩니다.

### H2 콘솔 접근
```
http://localhost:9029/h2-console

JDBC URL: jdbc:h2:mem:testdb
Username: sa
Password: (비워두기)
```

---

## 📊 API 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": {
    "message": "Action completed",
    "newBalance": 50000
  }
}
```

### 오류 응답
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🐛 문제 해결

### 포트 이미 사용 중

**백엔드 포트 9029**:
```bash
# 프로세스 찾기 (Windows)
netstat -ano | findstr :9029

# 또는 프로세스 강제 종료
taskkill /PID <PID> /F
```

**프론트엔드 포트 5173**:
```bash
# 프로세스 찾기 (Windows)
netstat -ano | findstr :5173

# 또는 프로세스 강제 종료
taskkill /PID <PID> /F
```

### Maven 빌드 실패

```bash
# 캐시 정리
cd backend
mvn clean

# 다시 빌드
mvn compile
mvn spring-boot:run
```

### 프론트엔드 패키지 설치 오류

```bash
cd frontend

# npm 캐시 정리
npm cache clean --force

# 다시 설치
npm install
npm run dev
```

### CORS 오류

CORS는 이미 설정되어 있습니다. 백엔드가 `http://localhost:5173`의 요청을 모두 허용합니다.

```java
@CrossOrigin(origins = "*")
```

---

## 📈 성능 모니터링

### 동시 요청 모니터링

```bash
# Apache Bench를 사용한 스트레스 테스트
ab -n 100 -c 10 -p payload.json -T application/json http://localhost:9029/api/trading/dashboard/1
```

### 백엔드 로그 분석

```bash
# Real-time 로그 보기
# (터미널에서 mvn spring-boot:run 실행 중)
# [com.fuzzing.agent.service.TradingService] DEBUG 메시지 확인
```

---

## 📚 추가 리소스

- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com)
- [Recharts 문서](https://recharts.org)

