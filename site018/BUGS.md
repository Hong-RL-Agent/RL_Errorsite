# BUGS - site018

## site018-bug01
- type: async-webhook-causality-inversion
- 한국어 유형: 비동기 웹훅의 인과 관계 역전
- API endpoint: POST /api/webhooks/simulate?scenario=causality-inversion
- data-bug-id selector: [data-bug-id="site018-bug01"]
- 사용자 증상: 이벤트 타임라인에서 subscription.activated가 payment.created보다 먼저 표시됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시: 
  {
    "ok": true,
    "scenario": "causality-inversion",
    "timeline": [
      { "type": "subscription.activated", "timestamp": "2024-05-01T10:00:00Z" },
      { "type": "payment.created", "timestamp": "2024-05-01T10:00:05Z" }
    ],
    "bugId": "site018-bug01"
  }
- 코드상 의도된 원인: 비동기 웹훅 이벤트 처리 순서를 await 없이 잘못 구성하거나, 의도적으로 잘못된 순서로 처리함
- PPO 기대 행동: 이벤트 처리 순서가 업무상 인과 관계(결제 생성 후 활성화)와 맞지 않는 점을 탐지

## site018-bug02
- type: missing-polymorphic-json-discriminator
- 한국어 유형: 다형성 JSON 타입 식별자 누락
- API endpoint: GET /api/events/polymorphic/missing-type
- data-bug-id selector: [data-bug-id="site018-bug02"]
- 사용자 증상: bank_transfer payload가 card_payment처럼 표시되거나 잘못 계산됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": {
      "eventId": "evt_999",
      "interpretedType": "card_payment",
      "payload": { "accountNumber": "123-...", "bankName": "..." }
    },
    "bugId": "site018-bug02"
  }
- 코드상 의도된 원인: payload.type이 없는데 기본 타입을 card_payment로 강제 처리함
- PPO 기대 행동: 응답 데이터의 타입 식별자 누락과 잘못된 타입 해석을 탐지

## site018-bug03
- type: opaque-sort-logic
- 한국어 유형: 정렬 로직의 불투명성
- API endpoint: GET /api/events?sort=risk
- data-bug-id selector: [data-bug-id="site018-bug03"]
- 사용자 증상: 위험도 높은 순 정렬을 선택했는데 위험도 낮은 이벤트가 상단에 섞여 표시됨
- 서버 응답 상태 코드: 200
- 코드상 의도된 원인: riskScore만 사용하지 않고 amount, timestamp, 임의 가중치를 섞은 불투명한 정렬식을 사용함
- PPO 기대 행동: UI 표시 순서가 사용자가 선택한 정렬 기준(위험도)과 맞지 않는 점을 탐지

## site018-bug04
- type: transaction-recovery-failure-after-crash
- 한국어 유형: 비정상 종료 후 트랜잭션 복구 실패
- API endpoint: POST /api/recovery/simulate-crash
- data-bug-id selector: [data-bug-id="site018-bug04"]
- 사용자 증상: 결제는 paid인데 청구서는 pending, 구독은 suspended로 표시되어 상태가 불일치함
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": {
      "payment": { "status": "paid" },
      "invoice": { "status": "pending" },
      "subscription": { "status": "suspended" }
    },
    "bugId": "site018-bug04"
  }
- 코드상 의도된 원인: mock crash 복구 과정에서 payment 상태만 복구하고 invoice, subscription 상태를 함께 복구하지 않음
- PPO 기대 행동: 여러 리소스의 상태가 하나의 트랜잭션 결과로 일관되지 않다는 점을 탐지
