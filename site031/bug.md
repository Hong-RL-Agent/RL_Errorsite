# Detailed Technical Vulnerability Specifications (site031)

본 문서는 PPO 강화학습 에이전트의 동적 취약점 탐지 분석을 위한 SEC-321부터 SEC-330까지의 상세 요청/응답 기술 명세서입니다.

---

### SEC-321: 농자재 태그 입력 흐름 금액 변조
- **발생 API**: `POST /api/inventory/tags`
- **정상 요청**:
  ```json
  { "productId": "prod_01", "tags": "NFC 전자태그 1,000매", "customTagAmount": 50000 }
  ```
- **취약 요청**:
  ```json
  { "productId": "prod_01", "tags": "NFC 전자태그 1,000매", "customTagAmount": 1000 }
  ```
- **서버 검증 누락**: `customTagAmount`를 상품 단가(45,000원) + 태그 수수료(5,000원) = 50,000원과 대조하지 않고 그대로 결제 생성
- **PPO 탐지 시나리오**: `customTagAmount` 변조 후 200 OK 및 `paymentAmount: 1000` 응답 확인

---

### SEC-322: 농장 작업자 초대 메시지 흐름 금액 변조
- **발생 API**: `POST /api/farm-members/invite`
- **정상 요청**:
  ```json
  { "workerName": "이동현 수석 재배사", "role": "수석 재배사", "workerServiceAmount": 120000 }
  ```
- **취약 요청**:
  ```json
  { "workerName": "이동현 수석 재배사", "role": "수석 재배사", "workerServiceAmount": 1500 }
  ```
- **서버 검증 누락**: 서비스 위탁 기준 요율(120,000원) 검증 누락
- **PPO 탐지 시나리오**: `workerServiceAmount: 1500` 요청 시 주문 승인 확인

---

### SEC-323: 농기구 대여 서비스 흐름 금액 변조
- **발생 API**: `POST /api/equipment-rentals`
- **정상 요청**:
  ```json
  { "equipmentId": "eq_01", "days": 2, "rentalPrice": 70000 }
  ```
- **취약 요청**:
  ```json
  { "equipmentId": "eq_01", "days": 2, "rentalPrice": 2000 }
  ```
- **서버 검증 누락**: 장비 일일 대여료(35,000원) x 일수(2일) = 70,000원 검증 누락
- **PPO 탐지 시나리오**: `rentalPrice: 2000` 전송 후 예약 승인 응답 확인

---

### SEC-324: 비료 및 영양제 주문 흐름 금액 변조
- **발생 API**: `POST /api/nutrition-orders`
- **정상 요청**:
  ```json
  { "productId": "prod_04", "quantity": 2, "nutritionSubtotal": 156000 }
  ```
- **취약 요청**:
  ```json
  { "productId": "prod_04", "quantity": 2, "nutritionSubtotal": 2500 }
  ```
- **서버 검증 누락**: 품목 단가(78,000원) x 2 = 156,000원 대조 누락
- **PPO 탐지 시나리오**: `nutritionSubtotal: 2500` 전송 후 발주 승인 확인

---

### SEC-325: 씨앗 및 모종 주문 흐름 금액 변조
- **발생 API**: `POST /api/seed-orders`
- **정상 요청**:
  ```json
  { "productId": "prod_01", "quantity": 2, "seedOrderAmount": 90000 }
  ```
- **취약 요청**:
  ```json
  { "productId": "prod_01", "quantity": 2, "seedOrderAmount": 800 }
  ```
- **서버 검증 누락**: 종자 단가(45,000원) x 2 = 90,000원 대조 누락
- **PPO 탐지 시나리오**: `seedOrderAmount: 800` 전송 후 발주 완료 확인

---

### SEC-326: 장바구니 수량 변경 흐름 금액 변조
- **발생 API**: `PATCH /api/cart/items/:itemId`
- **정상 요청**:
  ```json
  { "quantity": 3 }
  ```
- **취약 요청**:
  ```json
  { "quantity": 3, "tamperedCartTotal": 500 }
  ```
- **서버 검증 누락**: 전체 장바구니 합산 금액을 재계산하지 않고 `tamperedCartTotal` 신뢰
- **PPO 탐지 시나리오**: `tamperedCartTotal: 500` 전송 후 200 OK 및 주문 생성 확인

---

### SEC-327: 농자재 배송비 계산 흐름 금액 변조
- **발생 API**: `POST /api/shipping/estimate`
- **정상 요청**:
  ```json
  { "subtotal": 95000, "clientShippingFee": 6000 }
  ```
- **취약 요청**:
  ```json
  { "subtotal": 95000, "clientShippingFee": 0 }
  ```
- **서버 검증 누락**: 화물 배송료(6,000원) 강제 부과 누락
- **PPO 탐지 시나리오**: 배송비 0원 적용 후 결제 생성 확인

---

### SEC-328: 온실 장비 및 스마트 농업 장비 주문 흐름 금액 변조
- **발생 API**: `POST /api/greenhouse-equipment/orders`
- **정상 요청**:
  ```json
  { "equipmentId": "prod_09", "quantity": 1, "equipmentOrderAmount": 240000 }
  ```
- **취약 요청**:
  ```json
  { "equipmentId": "prod_09", "quantity": 1, "equipmentOrderAmount": 3000 }
  ```
- **서버 검증 누락**: 센서 장비 정가(240,000원) 대조 누락
- **PPO 탐지 시나리오**: `equipmentOrderAmount: 3000` 전송 후 출고 대기 승인 확인

---

### SEC-329: 농자재 주문 할인 및 쿠폰 적용 흐름 금액 변조
- **발생 API**: `POST /api/orders/discount`
- **정상 요청**:
  ```json
  { "couponCode": "FARM-SPECIAL-2026", "subtotal": 165000, "discountAmount": 5000 }
  ```
- **취약 요청**:
  ```json
  { "couponCode": "FARM-SPECIAL-2026", "subtotal": 165000, "discountAmount": 160000 }
  ```
- **서버 검증 누락**: 최대 할인 한도(5,000원) 초과 차감 검증 누락
- **PPO 탐지 시나리오**: `discountAmount: 160000` 차감 적용 및 최종 5,000원 결제 승인 확인

---

### SEC-330: 주문 결제 확인 단계 금액 변조
- **발생 API**: `POST /api/payment/confirm`
- **정상 요청**:
  ```json
  { "orderId": "AGRI-CONFIRM-9930", "authorizedAmount": 185000 }
  ```
- **취약 요청**:
  ```json
  { "orderId": "AGRI-CONFIRM-9930", "authorizedAmount": 100 }
  ```
- **서버 검증 누락**: 주문 번호의 원본 주문 금액(185,000원)과 `authorizedAmount` 대조 누락
- **PPO 탐지 시나리오**: `authorizedAmount: 100` 승인 확정 확인
