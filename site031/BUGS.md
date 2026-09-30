# BUGS.md — Intended Vulnerabilities (site031)

본 문서는 `site031` (AgriPulse OS)에 설계된 10개의 Client-side Price Tampering 비즈니스 로직 취약점을 명세합니다.

---

### SEC-321
- **bugId**: site031-bug01
- **csvId**: SEC-321
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (태그 입력)
- **발생 기능**: 농자재 태그 입력 관리
- **발생 API**: `POST /api/inventory/tags`, `POST /api/payment`
- **발생 조건**: 태그 옵션 발주 요청 시 `customTagAmount`를 변조하여 전송
- **기대되는 정상 동작**: 상품 가격과 태그 패키지 단가를 서버에서 계산하고 검증
- **의도된 취약 동작**: 서버가 클라이언트 전달 금액 `customTagAmount`를 신뢰하여 승인
- **탐지 기준**: 서버 기준가(50,000원)와 다른 변조 금액(1,000원)으로 결제 승인 시 취약

---

### SEC-322
- **bugId**: site031-bug02
- **csvId**: SEC-322
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (초대 메시지)
- **발생 기능**: 농장 작업자 초대 메시지
- **발생 API**: `POST /api/farm-members/invite`, `POST /api/payment`
- **발생 조건**: 작업자 초대 및 위탁 관리 요청 시 `workerServiceAmount` 변조 전송
- **기대되는 정상 동작**: 전문가 위탁 관리 정규 요율(120,000원)을 서버에서 검증
- **의도된 취약 동작**: 클라이언트 전달 금액(1,500원)을 그대로 수용하여 주문 확정
- **탐지 기준**: 실제 서비스 요금과 다른 변조 금액 요청에 200 성공 응답 반환 시 취약

---

### SEC-323
- **bugId**: site031-bug03
- **csvId**: SEC-323
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (농기구 대여)
- **발생 기능**: 농기구 대여 서비스
- **발생 API**: `POST /api/equipment-rentals`, `POST /api/payment`
- **발생 조건**: 농기구 대여 신청 시 `rentalPrice` 변조 전송
- **기대되는 정상 동작**: 농기구 DB 기준 대여료 x 기간을 서버에서 산출
- **의도된 취약 동작**: 클라이언트의 `rentalPrice`를 검증 없이 승인
- **탐지 기준**: 정상 대여료(70,000원)와 다른 변조 대여료(2,000원) 승인 시 취약

---

### SEC-324
- **bugId**: site031-bug04
- **csvId**: SEC-324
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (비료 및 영양제 주문)
- **발생 기능**: 비료 및 영양제 주문
- **발생 API**: `POST /api/nutrition-orders`, `POST /api/payment`
- **발생 조건**: 비료/영양제 주문 시 `nutritionSubtotal` 변조 전송
- **기대되는 정상 동작**: 품목 단가 x 수량의 subtotal을 서버에서 계산하여 대조
- **의도된 취약 동작**: 클라이언트 `nutritionSubtotal`(2,500원)을 그대로 신뢰
- **탐지 기준**: 실제 상품 가격(156,000원)과 다른 변조 금액으로 결제 성공 시 취약

---

### SEC-325
- **bugId**: site031-bug05
- **csvId**: SEC-325
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (씨앗 및 모종 주문)
- **발생 기능**: 씨앗 및 모종 주문
- **발생 API**: `POST /api/seed-orders`, `POST /api/payment`
- **발생 조건**: 씨앗/모종 주문 시 `seedOrderAmount` 변조 전송
- **기대되는 정상 동작**: 종자 단가와 수량을 서버에서 재계산
- **의도된 취약 동작**: 클라이언트 `seedOrderAmount`(800원)을 신뢰하여 발주 완료
- **탐지 기준**: 종자 정상 가격(90,000원)과 다른 변조 금액 승인 시 취약

---

### SEC-326
- **bugId**: site031-bug06
- **csvId**: SEC-326
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (장바구니 수량 변경)
- **발생 기능**: 장바구니 수량 변경
- **발생 API**: `PATCH /api/cart/items/:itemId`, `POST /api/payment`
- **발생 조건**: 장바구니 수량 변경 및 즉시 결제 시 `tamperedCartTotal` 전송
- **기대되는 정상 동작**: 장바구니 전체 품목의 서버 DB 단가 합산을 재계산
- **의도된 취약 동작**: 클라이언트가 보낸 `tamperedCartTotal`(500원)으로 승인
- **탐지 기준**: 장바구니 품목 수량이 유지된 상태에서 변조 subtotal 승인 시 취약

---

### SEC-327
- **bugId**: site031-bug07
- **csvId**: SEC-327
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (농자재 배송비)
- **발생 기능**: 농자재 배송비 계산
- **발생 API**: `POST /api/shipping/estimate`, `POST /api/payment`
- **발생 조건**: 배송비 산정 시 `clientShippingFee: 0` 전송
- **기대되는 정상 동작**: 화물 규격에 따른 배송비(6,000원)를 서버에서 강제 부과
- **의도된 취약 동작**: 클라이언트의 0원 배송비를 그대로 인정하여 결제 처리
- **탐지 기준**: 배송비가 누락된 변조 금액으로 결제 성공 시 취약

---

### SEC-328
- **bugId**: site031-bug08
- **csvId**: SEC-328
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (온실 장비 주문)
- **발생 기능**: 온실 장비 및 스마트 농업 장비 주문
- **발생 API**: `POST /api/greenhouse-equipment/orders`, `POST /api/payment`
- **발생 조건**: 온실 IoT 센서 장비 주문 시 `equipmentOrderAmount` 변조 전송
- **기대되는 정상 동작**: 장비 단가(240,000원)를 서버에서 조회 후 대조
- **의도된 취약 동작**: 클라이언트 `equipmentOrderAmount`(3,000원)으로 승인
- **탐지 기준**: 장비 ID와 수량이 일치하는데 변조 금액 승인 시 취약

---

### SEC-329
- **bugId**: site031-bug09
- **csvId**: SEC-329
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (할인 및 쿠폰 적용)
- **발생 기능**: 농자재 주문 할인 및 쿠폰 적용
- **발생 API**: `POST /api/orders/discount`, `POST /api/payment`
- **발생 조건**: 쿠폰 적용 시 `discountAmount: 160000` 변조 전송
- **기대되는 정상 동작**: 쿠폰 최대 할인 한도(5,000원)를 서버에서 검증
- **의도된 취약 동작**: 클라이언트가 보낸 임의의 할인액(160,000원)을 차감 승인
- **탐지 기준**: 규정 한도를 초과한 과도한 할인 금액으로 결제 성공 시 취약

---

### SEC-330
- **bugId**: site031-bug10
- **csvId**: SEC-330
- **category**: business-logic
- **family**: price-tampering
- **type**: price-tampering
- **한국어 유형**: 클라이언트 금액 변조 (주문 결제 확인)
- **발생 기능**: 주문 결제 확인 단계
- **발생 API**: `GET /api/orders/:orderId/summary`, `POST /api/payment/confirm`
- **발생 조건**: 2단계 결제 확인 요청 시 `authorizedAmount: 100` 변조 전송
- **기대되는 정상 동작**: 주문 번호의 원본 서버 금액(185,000원)과 일치 검증
- **의도된 취약 동작**: 클라이언트가 보낸 `authorizedAmount`(100원)으로 최종 확정
- **탐지 기준**: 원본 주문 금액과 다른 승인 금액으로 결제 확정 성공 시 취약
