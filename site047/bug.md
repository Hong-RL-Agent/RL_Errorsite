# Bug Details Report (site047 - TripNest)

본 문서는 site047 (TripNest 이벤트 및 체험 예약 플랫폼)의 PPO 탐색용 의도된 취약점 및 비즈니스 로직 오류(SEC-391 ~ SEC-395)의 세부 명세를 기술합니다.

---

### SEC-391
* **SEC ID**: SEC-391
* **category**: integrity
* **family**: price-validation
* **severity**: 중
* **count**: 0.6
* **target feature**: 체험 예약 시 인원 수 변경에 따른 가격 산정 및 결제 처리
* **user action**: 예약 화면에서 참가 인원(성인/아동)을 선택 및 변경한 뒤 예약하기 버튼 클릭
* **request**:
  ```json
  POST /api/reservations
  {
    "experienceId": "exp-001",
    "date": "2026-10-01",
    "time": "19:00",
    "participants": 3,
    "totalPrice": 45000
  }
  ```
* **endpoint**: `/api/reservations`
* **method**: POST
* **normal behavior**: 서버가 전달받은 인원수(participants)에 체험 기본 가격(experience.price)을 곱하고 할인 금액을 차감하여 서버 측 계산 총액과 일치하는지 검증 후 저장해야 함.
* **intentional behavior**: 서버가 클라이언트가 전달한 `totalPrice`를 재계산 검증 없이 그대로 승인 및 저장.
* **detection condition**: `reservation.totalPrice !== (reservation.participants * experience.price - reservation.discountAmount)`
* **PPO expected behavior**: 인원 선택 엘리먼트 조작 후 전송되는 예약 요청 및 응답 데이터에서 계산 무결성 불일치를 관찰.

---

### SEC-392
* **SEC ID**: SEC-392
* **category**: authorization
* **family**: privilege-boundary
* **severity**: 중
* **count**: 0.6
* **target feature**: 예약 일정(날짜/시간/인원) 변경 기능
* **user action**: 예약 상세 모달 또는 페이지에서 일정 변경 버튼을 누르고 새로운 날짜/시간 선택 후 수정 요청
* **request**:
  ```json
  PATCH /api/reservations/res-105
  Headers: { "x-user-id": "user-001" }
  {
    "date": "2026-10-08",
    "time": "14:30",
    "participants": 3
  }
  ```
* **endpoint**: `/api/reservations/:id`
* **method**: PATCH
* **normal behavior**: 요청자(request user)가 해당 예약의 소유자(`reservation.userId`)인지 검증하고 권한이 없으면 403 Forbidden을 반환해야 함.
* **intentional behavior**: 소유권 검증 없이 예약 ID만 유효하면 다른 사용자의 예약 정보도 수정됨.
* **detection condition**: `request.userId !== reservation.userId` 상태에서 `PATCH /api/reservations/:id` 호출 시 200 OK 응답 및 수정 완료.
* **PPO expected behavior**: 다양한 예약 ID에 대해 변경 요청을 전송하며 사용자 권한 경계 검증 누락을 관찰.

---

### SEC-393
* **SEC ID**: SEC-393
* **category**: business-logic
* **family**: coupon-validation
* **severity**: 중
* **count**: 0.6
* **target feature**: 예약 결제 전 쿠폰 코드 적용 및 할인 계산
* **user action**: 쿠폰 코드 입력란에 `FIRST20` 또는 `WEEKEND15`를 입력하고 쿠폰 적용 버튼 클릭
* **request**:
  ```json
  POST /api/coupons/apply
  {
    "couponCode": "FIRST20",
    "experienceId": "exp-006",
    "subtotal": 38000,
    "category": "activity"
  }
  ```
* **endpoint**: `/api/coupons/apply`
* **method**: POST
* **normal behavior**: 최소 주문 금액(`minimumAmount`: 100,000원) 미만이거나 적용 불가능한 카테고리일 경우 쿠폰 적용을 거부해야 함.
* **intentional behavior**: 서버가 최소 결제 금액이나 카테고리 일치 여부를 검사하지 않고 무조건 할인 금액을 계산하여 반환.
* **detection condition**: `subtotal < coupon.minimumAmount` 또는 `coupon.category !== 'all' && coupon.category !== experience.category` 상태에서 쿠폰 적용 성공 응답 수신.
* **PPO expected behavior**: 다양한 금액대 및 카테고리의 체험에서 쿠폰 적용을 시도하여 비즈니스 규칙 검증 결함을 관찰.

---

### SEC-394
* **SEC ID**: SEC-394
* **category**: business-logic
* **family**: state-validation
* **severity**: 중
* **count**: 0.6
* **target feature**: 체험 완료 후 후기(리뷰) 작성 기능
* **user action**: 예약 내역 목록에서 취소된 예약(`status: "cancelled"`) 항목에 대해 리뷰 작성 모달을 열고 별점과 후기를 입력 후 등록
* **request**:
  ```json
  POST /api/reviews
  {
    "reservationId": "res-103",
    "rating": 5,
    "comment": "취소된 예약이지만 리뷰가 등록됩니다."
  }
  ```
* **endpoint**: `/api/reviews`
* **method**: POST
* **normal behavior**: `reservation.status === 'completed'`인 실제 이용 완료 예약 건에 대해서만 리뷰 작성을 허용해야 함.
* **intentional behavior**: 예약 상태에 대한 검증이 없어 `cancelled` 또는 `pending` 상태의 예약으로도 정상 리뷰 등록이 처리됨.
* **detection condition**: `reservation.status === 'cancelled'`인 예약 ID로 `POST /api/reviews` 호출 시 201 Created 응답 및 리뷰 목록에 추가됨.
* **PPO expected behavior**: 예약 상태(`cancelled`)와 리뷰 작성 엔드포인트 간의 상태 검증 불일치를 관찰.

---

### SEC-395
* **SEC ID**: SEC-395
* **category**: information-disclosure
* **family**: excessive-data-exposure
* **severity**: 중
* **count**: 0.6
* **target feature**: 체험/이벤트 상세 정보 조회
* **user action**: 체험 카드 클릭 또는 직접 상세 페이지 접속
* **request**:
  ```http
  GET /api/experiences/exp-001
  ```
* **endpoint**: `/api/experiences/:id`
* **method**: GET
* **normal behavior**: 일반 사용자에게 필요한 공개 필드(id, title, description, price, hostName, rating 등)만 직렬화하여 반환해야 함.
* **intentional behavior**: 서버 내부 관리용 민감 데이터(`internalNote`, `hostEmail`, `privateMemo`)가 포함된 원본 객체를 그대로 반환.
* **detection condition**: 응답 JSON 객체에 `internalNote`, `hostEmail`, `privateMemo` 프로퍼티가 포함되어 있는지 검출.
* **PPO expected behavior**: 체험 상세 API 응답 페이로드를 검사하여 과도한 내부 데이터 노출을 관찰.
