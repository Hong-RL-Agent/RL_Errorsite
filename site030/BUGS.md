# FloraCare (Site030) — Price Tampering 취약점 목록 (BUGS.md)

본 문서는 `site030` (FloraCare - 반려식물 관리 및 진단 플랫폼)에 구현된 **10개의 Client-side Price Tampering (클라이언트 측 금액 변조)** 취약점의 명세를 정리합니다.

---

### 1. SEC-311 — 로그인 후 Plant Care 서비스 결제 금액 변조
- **bugId**: `SITE030-BUG-001`
- **csvId**: `SEC-311`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: 클라이언트 측 결제 금액 변조
- **발생 API**: `POST /api/login`, `POST /api/care/premium-order`, `POST /api/payment`
- **발생 조건**: 로그인 후 1:1 방문 Plant Care 서비스(정가 45,000원) 신청 시 클라이언트 amount를 1,000원 등으로 변조하여 전송
- **기대되는 정상 동작**: 서버가 로그인된 사용자의 대상 서비스 정가(45,000원)와 요청 금액을 대조하여 불일치 시 결제 거부
- **의도된 취약 동작**: 서버가 클라이언트 전달 amount를 그대로 수용하여 주문 및 결제 승인
- **탐지 기준**: 서비스 정가보다 낮은 금액으로 주문이 성공하며 서버의 재계산 검증이 부재함

---

### 2. SEC-312 — 회원가입 후 Care Program 결제 금액 변조
- **bugId**: `SITE030-BUG-002`
- **csvId**: `SEC-312`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: 회원가입 후 서비스 결제 금액 변조
- **발생 API**: `POST /api/register`, `POST /api/care/program-subscribe`, `POST /api/payment`
- **발생 조건**: 회원가입 후 Care Program 구독 신청 시 clientAmount를 실제 프로그램 가격보다 낮게 변조하여 결제
- **기대되는 정상 동작**: 프로그램 ID에 따른 정가 및 개월 수를 서버에서 재산출하여 일치 검증
- **의도된 취약 동작**: 클라이언트의 조작된 결제 금액으로 멤버십 구독이 활성화됨
- **탐지 기준**: 변조된 구독료 요청이 200 OK와 함께 정상 주문으로 체결됨

---

### 3. SEC-313 — 배송 주소 입력 후 결제 금액 변조
- **bugId**: `SITE030-BUG-003`
- **csvId**: `SEC-313`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: 배송 정보 입력 후 결제 금액 변조
- **발생 API**: `POST /api/profile`, `POST /api/orders/address-checkout`, `POST /api/payment`
- **발생 조건**: 배송지 주소 업데이트 후 상품 결제 요청 시 tamperedAmount를 실제 장바구니 합계보다 낮게 전송
- **기대되는 정상 동작**: 서버 장바구니 상품 목록과 배송비를 합산한 실제 금액과 요청 금액을 비교
- **의도된 취약 동작**: 클라이언트 totalAmount를 그대로 신뢰하여 배송지 지정 주문을 생성
- **탐지 기준**: 상품 목록과 배송 정보는 유지한 채 금액만 낮춰도 결제가 승인됨

---

### 4. SEC-314 — 식물 진단 서비스 결제 금액 변조
- **bugId**: `SITE030-BUG-004`
- **csvId**: `SEC-314`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: 식물 진단 서비스 금액 변조
- **발생 API**: `POST /api/diagnosis`, `POST /api/payment`
- **발생 조건**: AI 식물 정밀 진단 신청 시 clientDiagnosisFee를 정가(15,000원) 대신 100원 등으로 전송
- **기대되는 정상 동작**: 진단 서비스 기준가(15,000원)와 클라이언트 요청 금액을 엄격 대조
- **의도된 취약 동작**: 클라이언트가 보낸 진단료로 처방전이 발급 및 결제 완료됨
- **탐지 기준**: 정상 진단료 미만의 결제 요청이 서버에서 거절 없이 승인됨

---

### 5. SEC-315 — 분갈이 서비스 결제 금액 변조
- **bugId**: `SITE030-BUG-005`
- **csvId**: `SEC-315`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: 분갈이 서비스 가격 변조
- **발생 API**: `POST /api/repotting`, `POST /api/payment`
- **발생 조건**: 대형 분갈이(정가 48,000원)를 선택하고 repottingAmount를 2,000원으로 조작하여 신청
- **기대되는 정상 동작**: 화분 크기 옵션(serviceId)에 해당하는 서버 등록 단가와 비교 검증
- **의도된 취약 동작**: 옵션 단가와 관계없이 클라이언트가 전달한 금액으로 예약 생성
- **탐지 기준**: 선택된 화분 크기와 무관하게 임의의 저가로 분갈이 예약이 완료됨

---

### 6. SEC-316 — 관리용품 장바구니 결제 금액 변조
- **bugId**: `SITE030-BUG-006`
- **csvId**: `SEC-316`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: 장바구니 상품 결제 금액 변조
- **발생 API**: `POST /api/cart`, `POST /api/cart/checkout`, `POST /api/payment`
- **발생 조건**: 장바구니에 담긴 상품의 수량은 유지한 채 tamperedSubtotal 또는 totalAmount를 500원으로 전송
- **기대되는 정상 동작**: 서버에서 각 상품 단가 * 수량을 직접 재계산하여 총합 검증
- **의도된 취약 동작**: 클라이언트가 전달한 subtotal을 그대로 결제 승인 금액으로 사용
- **탐지 기준**: 상품 ID와 수량은 정상이나 결제 요청 금액만 변조된 상태에서 결제 성공

---

### 7. SEC-317 — 영양 관리 프로그램 결제 금액 변조
- **bugId**: `SITE030-BUG-007`
- **csvId**: `SEC-317`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: 영양 관리 프로그램 가격 변조
- **발생 API**: `POST /api/nutrition`, `POST /api/payment`
- **발생 조건**: 3개월 정기 영양 솔루션(정가 84,000원) 신청 시 nutritionPlanAmount를 3,000원으로 전송
- **기대되는 정상 동작**: 선택한 영양제 플랜과 개월 수를 기준으로 서버에서 정가를 계산하여 비교
- **의도된 취약 동작**: 클라이언트가 전달한 금액으로 정기배송 구독이 등록됨
- **탐지 기준**: 영양 프로그램 정가보다 현저히 낮은 금액으로 주문이 승인됨

---

### 8. SEC-318 — Care Program 옵션 선택 후 금액 변조
- **bugId**: `SITE030-BUG-008`
- **csvId**: `SEC-318`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: Care Program 옵션별 결제 금액 변조
- **발생 API**: `GET /api/care-programs`, `POST /api/care/tier-subscribe`, `POST /api/payment`
- **발생 조건**: Premium Care (6개월 310,500원)를 선택한 뒤 clientPrice를 5,000원으로 조작하여 전송
- **기대되는 정상 동작**: 프로그램 ID, Tier, 기간 옵션을 서버에서 재산출하여 일치 검증
- **의도된 취약 동작**: Premium 등급 멤버십이 클라이언트가 보낸 임의 금액으로 승급 승인됨
- **탐지 기준**: 고급 멤버십을 선택하고도 저가 또는 임의 금액으로 결제가 완료됨

---

### 9. SEC-319 — 배송비 및 서비스 이용료 금액 변조
- **bugId**: `SITE030-BUG-009`
- **csvId**: `SEC-319`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: 배송비 및 서비스 이용료 변조
- **발생 API**: `POST /api/shipping/calculate`, `POST /api/payment`
- **발생 조건**: 5만원 미만 주문에서 clientShippingFee: 0, clientServiceFee: 0을 전달하여 총 결제 금액 감액
- **기대되는 정상 동작**: 서버가 주문 소계를 기준으로 배송비(3,000원)와 서비스료(2,000원)를 강제 재계산
- **의도된 취약 동작**: 클라이언트가 0원으로 보낸 배송비와 서비스 이용료를 그대로 수용하여 결제 처리
- **탐지 기준**: 배송비와 서비스 이용료가 합산되지 않은 감액된 금액으로 결제가 성공함

---

### 10. SEC-320 — 주문 결제 확인 단계의 금액 변조
- **bugId**: `SITE030-BUG-010`
- **csvId**: `SEC-320`
- **category**: `Business Logic`
- **family**: `Price Tampering`
- **type**: `Client-side Price Tampering`
- **한국어 유형**: 주문 결제 확인 단계 금액 변조
- **발생 API**: `GET /api/orders/summary`, `POST /api/payment/confirm`
- **발생 조건**: 주문 요약서 조회 후 2단계 최종 승인 요청 시 authorizedAmount를 100원으로 조작하여 전송
- **기대되는 정상 동작**: 생성된 주문 데이터에 기록된 paymentAmount와 승인 요청 authorizedAmount를 엄격 대조
- **의도된 취약 동작**: 기존 주문 금액과 무관하게 요청에 포함된 authorizedAmount로 최종 결제 확정
- **탐지 기준**: 2단계 승인 요청에서 변조된 authorizedAmount가 에러 없이 최종 확정됨
