# 결함 상세 분석

## Index 160: Race Condition - 동시 출금

### 문제 설명
두 개 이상의 스레드가 동시에 같은 계정에서 출금을 시도할 때, 잔액 검증 로직과 실제 차감 로직 사이의 시간 차이로 인해 음수 잔액이 발생할 수 있습니다.

### 코드 위치
`backend/src/main/java/com/fuzzing/agent/service/TradingService.java` - `withdraw()` 메서드

### 원인
```java
// 시점 T1: 잔액 확인
BigDecimal currentBalance = account.getBalance(); // $100,000
if (currentBalance.compareTo(amount) < 0) { ... } // 통과

// [의도적 지연 50ms - 다른 요청이 개입 가능]
Thread.sleep(50);

// 시점 T2: 차감 처리
// 이 사이에 다른 스레드도 같은 로직 실행 가능
account.setBalance(account.getBalance().subtract(amount)); // $100,000 - $60,000 = $40,000
```

### 시나리오
```
스레드 A          시점        스레드 B
------------------------------------------
잔액 확인 (100k)   T1
  ↓
[지연 50ms]
  ↓                T2        잔액 확인 (100k)
  ↓                T3          ↓
  ↓                          [지연 50ms]
  ↓                T4          ↓
차감: 100k - 60k = 40k  T5      ↓
  ↓                T6        차감: 100k - 60k = 40k
완료: 잔액 40k      T7        완료: 잔액 40k

결과: 40k + 40k을 차감했지만, 실제 차감액은 60k만 적용됨
```

### 테스트 방법
```bash
# 5개의 출금 요청을 빠르게 연속 전송
for i in {1..5}; do
  curl -X POST http://localhost:9029/api/trading/withdraw \
    -H "Content-Type: application/json" \
    -d '{"userId": 1, "amount": 50000}' &
done
wait

# 대시보드에서 잔액 확인
curl http://localhost:9029/api/trading/dashboard/1 | jq '.data.account.balance'
```

### 예상 결과
정상적으로는:
- 첫 번째 출금: 100,000 - 50,000 = 50,000 (성공)
- 두 번째 출금: 50,000 - 50,000 = 0 (성공)
- 나머지: 잔액 부족으로 실패

하지만 Race Condition으로:
- 모든 요청이 성공하여 최종 잔액이 음수가 될 수 있음
- 예: -150,000

---

## Index 165: Atomic Failure - 포인트 차감 & 아이템 지급 불일치

### 문제 설명
포인트 차감과 아이템 지급이 하나의 트랜잭션으로 처리되지 않아, 포인트는 차감되었으나 아이템 지급이 실패하는 경우가 발생합니다.

### 코드 위치
`backend/src/main/java/com/fuzzing/agent/service/TradingService.java` - `buyItem()` 메서드

### 원인
```java
// 1단계: 포인트 차감 (성공)
account.setPoints(account.getPoints().subtract(pointCost));
accountRepository.save(account);

// [의도적 지연 40ms]
Thread.sleep(40);

// 2단계: 아이템 지급 (실패할 수 있음)
Item item = Item.builder()
    .user(user)
    .itemName(itemName)
    .quantity(quantity)
    .category("TRADING_ITEM")
    .build();

try {
    itemRepository.save(item);
} catch (Exception e) {
    // 포인트는 이미 차감됨!
    return Map.of("success", false, "pointsDeducted", true, "itemGranted", false);
}
```

### 시나리오
```
사용자 A: 5,000 포인트 보유, Gold Coin 구매 (비용: 500 포인트)
사용자 B: 동시에 같은 아이템 구매

시점 1: 사용자 A - 포인트 차감 (5,000 → 4,500)  ✓ 저장됨
시점 2: [지연 40ms] - 데이터베이스 부하 증가
시점 3: 사용자 B - 포인트 차감 (4,500 → 4,000)   ✓ 저장됨
시점 4: [지연 40ms]
시점 5: 사용자 A - 아이템 지급 시도 → 실패!     ✗ 오류 발생
시점 6: 사용자 B - 아이템 지급 성공           ✓ 지급됨

결과:
- 사용자 A: 포인트 500 손실, 아이템 0개
- 사용자 B: 포인트 500 손실, 아이템 1개
```

### 테스트 방법
```bash
# 동일 사용자로 동시에 여러 아이템 구매
curl -X POST http://localhost:9029/api/trading/buy-item \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "itemName": "Gold Coin", "quantity": 10, "pointCost": 500}' &

curl -X POST http://localhost:9029/api/trading/buy-item \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "itemName": "Silver Coin", "quantity": 5, "pointCost": 300}' &

wait

# 최종 상태 확인
curl http://localhost:9029/api/trading/dashboard/1 | jq '.data | {points: .account.points, items: .items}'
```

### 예상 결과
정상적으로는:
- 포인트 차감: 500 + 300 = 800 포인트 손실
- 아이템 획득: 2개

하지만 Atomic Failure로:
- 포인트 차감: 800 포인트 손실
- 아이템 획득: 1개만 획득 (하나는 실패)
- 불일치: 포인트는 차감됨, 아이템은 일부만 지급됨

---

## Index 175: Thread Starvation - 특정 유저 요청 무한 지연

### 문제 설명
특정 사용자를 대상으로 Thread Starvation을 활성화하면, 해당 사용자의 모든 거래 요청이 무한정 지연되어 응답이 없습니다.

### 코드 위치
`backend/src/main/java/com/fuzzing/agent/service/TradingService.java` - `withdraw()` 메서드 초반부

### 원인
```java
// Starvation이 활성화된 사용자 확인
if (USER_STARVATION_LOCK.containsKey(userId)) {
    log.warn("User {} is in starvation state", userId);
    try {
        // Thread.MAX_VALUE만큼 대기 = 영원히 대기
        Thread.sleep(Long.MAX_VALUE);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}
```

### 시나리오
```
초기 상태:
- User 1: 정상 (Starvation 없음)

1단계: Starvation 활성화
POST /api/trading/trigger-starvation/1
→ USER_STARVATION_LOCK.put(1, System.currentTimeMillis())

2단계: User 1이 거래 요청
POST /api/trading/withdraw
→ withdraw() 메서드 시작
→ if (USER_STARVATION_LOCK.containsKey(userId)) // true!
→ Thread.sleep(Long.MAX_VALUE) // 9,223,372,036,854,775,807ms = ~292,471,209,484년

결과: 요청은 영원히 반환되지 않음!
```

### 테스트 방법
```bash
# 1. Starvation 활성화
curl -X POST http://localhost:9029/api/trading/trigger-starvation/1

# 2. 이 요청은 응답이 없을 것 (타임아웃까지 대기)
timeout 10 curl -X POST http://localhost:9029/api/trading/withdraw \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 10000}'
# 결과: Command 'curl' timed out

# 3. Starvation 해제
curl -X POST http://localhost:9029/api/trading/release-starvation/1

# 4. 이제 정상적으로 응답
curl -X POST http://localhost:9029/api/trading/withdraw \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 10000}'
# 결과: {"success": true, ...}
```

### 예상 결과
- Starvation 활성화 후: **모든 요청이 타임아웃** (HTTP 요청 기본 타임아웃)
- Starvation 해제 후: **정상 응답**

### 서버 로그
```
[WARN] User 1 is in starvation state
```

---

## 퍼징 에이전트 테스트 포인트

### Race Condition (Index 160) 검증
1. ✓ 동시 요청 처리 여부
2. ✓ 음수 잔액 탐지
3. ✓ 트랜잭션 로그 불일치
4. ✓ 초과 출금 발생

### Atomic Failure (Index 165) 검증
1. ✓ 부분 실패 상황 감지
2. ✓ 포인트 손실 감지
3. ✓ 아이템 미지급 감지
4. ✓ 상태 불일치 감지

### Thread Starvation (Index 175) 검증
1. ✓ 무한 대기 상황 감지
2. ✓ 타임아웃 처리
3. ✓ 사용자별 독립적 영향
4. ✓ 복구 가능성 확인

