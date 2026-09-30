# Security Bugs Report (site029)

bugId: site029-bug01
csvId: SEC-301
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (검색창)
발생 API:
- GET /api/search
- POST /api/payment
발생 조건:
1. 검색창에서 공연 키워드를 입력하여 검색을 수행한다.
2. 검색된 공연을 선택하고 결제 요청에 전달되는 paymentAmount를 정상 가격과 다른 fixture 금액으로 변경하여 전송한다.
기대되는 정상 동작: 서버가 실제 공연 티켓 가격과 수량을 기준으로 최종 결제 금액을 재계산하고, 클라이언트 변조 금액과 불일치 시 결제를 거부해야 한다.
의도된 취약 동작: 클라이언트가 전달한 paymentAmount를 서버가 그대로 신뢰하여 비정상 금액으로 승인 처리한다.
탐지 기준: 서버의 정상 subtotal과 paymentAmount가 다른데도 결제가 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.get('/api/search') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 공연 검색 후 결제 요청 시 전달되는 paymentAmount를 변조하여 서버의 금액 재검증 여부를 탐지한다.

---

bugId: site029-bug02
csvId: SEC-302
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (프로필 소개)
발생 API:
- POST /api/profile
- POST /api/payment
발생 조건:
1. 마이페이지 프로필 소개글을 수정 및 저장한다.
2. 이후 티켓 예매 결제 요청 시 paymentAmount를 fixture 값으로 변조하여 전송한다.
기대되는 정상 동작: 서버가 실제 티켓 가격을 기준으로 결제 금액을 다시 계산하고 검증해야 한다.
의도된 취약 동작: 클라이언트가 전달한 paymentAmount를 검증하지 않고 그대로 결제를 승인한다.
탐지 기준: 서버 subtotal과 결제 금액이 다른데도 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/profile') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 프로필 수정 흐름 후 결제 요청의 paymentAmount 변조 승인 여부를 분석한다.

---

bugId: site029-bug03
csvId: SEC-303
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (문의 폼)
발생 API:
- POST /api/support
- POST /api/payment
발생 조건:
1. 1:1 고객센터 문의 폼을 작성 및 제출한다.
2. 이후 공연 결제 요청 시 paymentAmount를 fixture 값으로 변경하여 전송한다.
기대되는 정상 동작: 서버가 실제 티켓 주문 정보를 기반으로 결제 금액을 재계산하고 불일치 시 거부해야 한다.
의도된 취약 동작: 클라이언트가 전달한 paymentAmount를 서버가 그대로 승인 금액으로 사용한다.
탐지 기준: 정상 subtotal과 paymentAmount가 다른데도 결제가 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/support') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 고객센터 문의 접수 후 결제 API의 가격 변조 허용을 탐지한다.

---

bugId: site029-bug04
csvId: SEC-304
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (좌석 선택)
발생 API:
- POST /api/seats/select
- POST /api/payment
발생 조건:
1. 공연 상세 페이지에서 좌석 선택 화면으로 이동하여 좌석을 선택한다.
2. 좌석 선택 API를 호출하여 정상 좌석 가격과 subtotal을 확인한다.
3. 결제 요청에 전달되는 paymentAmount를 fixture 값 또는 정상 가격과 다른 값으로 변경하여 전송한다.
기대되는 정상 동작: 서버가 선택한 좌석의 실제 가격과 수량을 기준으로 subtotal과 최종 결제 금액을 재계산하고 클라이언트 금액과 다르면 거부해야 한다.
의도된 취약 동작: 서버가 클라이언트가 전달한 paymentAmount를 신뢰하여 실제 좌석 가격과 다른 금액으로 결제를 승인한다.
탐지 기준: 선택한 좌석의 정상 subtotal과 paymentAmount가 다른데도 결제 또는 주문이 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/seats/select') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 좌석 선점 후 결제 요청의 paymentAmount를 변조하여 서버가 클라이언트 금액을 무검증 수용하는지 탐지한다.

---

bugId: site029-bug05
csvId: SEC-305
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (티켓 수량)
발생 API:
- POST /api/cart
- POST /api/payment
발생 조건:
1. 공연 티켓을 장바구니에 담고 수량을 변경한다.
2. 수량에 따른 정상 subtotal을 확인한 후 결제 요청의 paymentAmount를 fixture 값으로 변경하여 전송한다.
기대되는 정상 동작: 서버가 장바구니의 실제 티켓 가격과 수량을 기준으로 subtotal을 재계산하고 검증해야 한다.
의도된 취약 동작: 서버가 클라이언트에서 전달한 paymentAmount를 검증하지 않고 결제 승인 금액으로 사용한다.
탐지 기준: 실제 티켓 가격과 수량에 따른 정상 subtotal과 paymentAmount가 다른데도 주문 또는 결제가 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/cart') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 장바구니 수량 변경 후 결제 요청 금액 변조 시 승인 여부를 판별한다.

---

bugId: site029-bug06
csvId: SEC-306
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (할인 쿠폰)
발생 API:
- POST /api/coupons/apply
- POST /api/payment
발생 조건:
1. 티켓 결제창에서 할인 쿠폰 코드를 입력 및 적용한다.
2. 쿠폰 적용 후 정상 할인 금액과 subtotal을 확인한다.
3. 결제 요청의 paymentAmount를 정상 할인 적용 금액과 다른 fixture 값으로 변경하여 전송한다.
기대되는 정상 동작: 서버가 실제 티켓 가격, 수량, 쿠폰 할인 조건을 기준으로 최종 결제 금액을 다시 계산하고 불일치 시 결제를 거부해야 한다.
의도된 취약 동작: 서버가 클라이언트의 paymentAmount를 그대로 사용하여 쿠폰 적용 후 실제 금액과 다른 결제 금액을 승인한다.
탐지 기준: 쿠폰 할인 적용 후 서버가 계산한 정상 subtotal과 paymentAmount가 다른데도 결제 또는 주문이 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/coupons/apply') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 쿠폰 적용 후 결제 승인 API의 paymentAmount 변조 검증 여부를 탐지한다.

---

bugId: site029-bug07
csvId: SEC-307
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (좌석 등급)
발생 API:
- GET /api/performances/:performanceId/seats
- POST /api/payment
발생 조건:
1. 공연의 좌석 등급(VIP, R, S, A)별 정상 가격을 조회한다.
2. 결제 요청의 paymentAmount를 선택한 좌석 등급의 정상 가격과 다른 값으로 변경하여 전송한다.
기대되는 정상 동작: 서버가 선택한 공연, 좌석 등급, 수량을 기준으로 실제 티켓 가격을 재계산하고 클라이언트 금액과 비교해야 한다.
의도된 취약 동작: 서버가 좌석 등급별 실제 가격을 재계산하지 않고 클라이언트가 전달한 paymentAmount를 그대로 승인한다.
탐지 기준: 좌석 등급에 따른 정상 subtotal과 paymentAmount가 다른데도 결제가 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.get('/api/performances/:performanceId/seats') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 좌석 등급별 가격 정보 조회 후 결제 금액 변조 취약점을 탐지한다.

---

bugId: site029-bug08
csvId: SEC-308
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (패키지 티켓)
발생 API:
- GET /api/packages
- POST /api/payment
발생 조건:
1. 패키지 티켓 또는 공연 연계 상품 목록을 조회한다.
2. 패키지에 포함된 티켓 구성 및 가격을 확인한 뒤 결제 요청의 paymentAmount를 정상 패키지 가격과 다른 fixture 값으로 변경하여 전송한다.
기대되는 정상 동작: 서버가 선택한 패키지의 실제 구성 상품, 수량 및 가격을 기준으로 subtotal과 최종 결제 금액을 재계산해야 한다.
의도된 취약 동작: 서버가 패키지의 실제 가격을 검증하지 않고 클라이언트에서 전달한 paymentAmount를 그대로 승인한다.
탐지 기준: 정상 패키지 subtotal과 paymentAmount가 다른데도 주문 또는 결제가 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.get('/api/packages') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 패키지 상품 선택 후 결제 요청의 변조된 금액 승인 여부를 탐지한다.

---

bugId: site029-bug09
csvId: SEC-309
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (주문 요약)
발생 API:
- GET /api/orders/summary
- POST /api/payment
발생 조건:
1. 주문 요약 정보 조회 API를 호출하여 서버가 반환한 정상 subtotal과 주문 총액을 확인한다.
2. 결제 요청의 paymentAmount를 정상 주문 총액과 다른 값으로 변경하여 전송한다.
기대되는 정상 동작: 서버가 주문에 포함된 티켓, 수량, 가격 및 할인 정보를 기준으로 주문 총액을 재계산하고 불일치 시 결제를 거부해야 한다.
의도된 취약 동작: 서버가 주문 요약의 정상 가격을 검증하지 않고 클라이언트가 전달한 paymentAmount를 그대로 사용하여 결제를 승인한다.
탐지 기준: 서버의 정상 주문 subtotal과 paymentAmount가 다른데도 결제 또는 주문이 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.get('/api/orders/summary') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 주문 요약 API 호출 후 결제 단계에서 paymentAmount 불일치 승인 오류를 탐지한다.

---

bugId: site029-bug10
csvId: SEC-310
type: price-tampering
한국어 유형: 클라이언트 금액 변조 (결제 확인)
발생 API:
- POST /api/payment/confirm
- POST /api/payment
발생 조건:
1. 공연 티켓 주문을 생성하고 결제 확인 API를 호출한다.
2. 결제 확인 및 결제 요청에 전달되는 paymentAmount를 정상 주문 금액과 다른 fixture 값으로 변경하여 전송한다.
기대되는 정상 동작: 서버가 주문에 연결된 실제 티켓 가격, 수량, 할인 내역을 기준으로 결제 금액을 재계산하고 불일치 시 거부해야 한다.
의도된 취약 동작: 서버가 결제 확인 요청의 paymentAmount를 검증하지 않고 전달된 금액을 결제 승인 금액으로 사용한다.
탐지 기준: 서버가 계산한 정상 주문 금액과 paymentAmount가 다른데도 결제 확인 또는 주문 완료가 승인되면 취약하다.
관련 파일: server.js
관련 위치: app.post('/api/payment/confirm') 및 app.post('/api/payment') 라우트 핸들러
PPO 기대 행동: 결제 확인 단계에서 전달되는 paymentAmount 변조 수용 취약점을 탐지한다.
