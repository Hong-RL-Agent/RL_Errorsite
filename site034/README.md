# PawMate (site034) - Pet Care Booking & Supplies Platform

**PawMate (`site034`)**는 반려동물 보호자가 믿을 수 있는 전문 펫시터/그루머의 돌봄 서비스를 예약하고 프리미엄 반려동물 용품을 원스톱으로 구매할 수 있는 통합 펫 케어 플랫폼입니다.

본 사이트는 PPO(Proximal Policy Optimization) 기반 강화학습 에이전트가 실제 서비스 환경과 유사한 조건에서 다양한 사용자 행동과 API 요청을 탐색하며 **5가지 주요 비즈니스 로직 결함(SEC-351 ~ SEC-355)**을 동적으로 탐지할 수 있도록 구축된 학습용 웹 애플리케이션입니다.

---

## 1. 프로젝트 기본 정보

- **Site ID**: `site034`
- **Port**: `9933`
- **서비스명**: PawMate
- **테마 & 콘셉트**: 반려동물 돌봄 예약 및 프리미엄 용품 플랫폼 (Pet Care Booking & Supplies Platform)
- **디자인 팔레트**: Soft Mint (`#2ec4b6`), Coral (`#ff6b6b`), Warm Cream (`#fdfbf7`), Dark Charcoal (`#2b2d42`), Light Beige (`#f7f3ec`)
- **기술 스택**: React 18, Vite, Express, Vanilla CSS Design System, Lucide React Icons

---

## 2. 주요 서비스 기능

1. **돌봄 서비스 탐색 및 예약 (Care Services)**: 1:1 맞춤 안심 산책, 홈 방문 돌봄, 프리미엄 탄산 스파 가위컷 미용, 24시 호텔링 예약
2. **반려동물 프로필 관리 (Pets Management)**: 품종, 연령, 체중, 건강 상태, 예방접종 이력 및 특이사항 관리
3. **용품 마켓 & 간편 주문 (Supplies Market)**: 유기농 동결건조 사료, 수제 간식, 훈련 장난감, 위생용품 쇼핑
4. **쿠폰 및 리워드 포인트 (Coupons & Points)**: 웰컴 할인 쿠폰, 돌봄 이용 리워드 적립 및 결제 할인
5. **예약 일정 및 환불 관리 (Bookings)**: 실시간 예약 확정/취소 및 포인트 환불 이력 추적
6. **댕냥이 커뮤니티 (Community)**: 보호자 일상 자랑 및 전문 펫시터 케어 팁 공유

---

## 3. 설치 및 실행 방법

### 패키지 설치
```bash
npm install
```

### 프론트엔드 빌드
```bash
npm run build
```

### Express 서버 실행 (Port: 9933)
```bash
npm start
```

### 헬스체크 확인
```bash
curl http://localhost:9933/api/health
```

---

## 4. 구현된 5대 비즈니스 로직 결함 개요

| Bug ID | CSV ID | 취약점 유형 | 발생 API | 설명 |
|---|---|---|---|---|
| `site034-bug01` | `SEC-351` | 예약 시간 중복 검증 누락 | `POST /api/bookings` | 동일 돌봄 제공자의 동일 일자/시간대에 중복 예약이 충돌 검증 없이 추가 승인됨 |
| `site034-bug02` | `SEC-352` | 예약 취소 후 환불 포인트 중복 처리 오류 | `POST /api/bookings/:id/refund` | 취소된 예약에 대해 중복 환불 요청 시 포인트가 제한 없이 이중 적립됨 |
| `site034-bug03` | `SEC-353` | 쿠폰 사용 횟수 제한 검증 오류 | `POST /api/coupons/:id/apply` | 1회 한정 쿠폰이 사용 횟수 초과 검증 없이 무제한 반복 적용됨 |
| `site034-bug04` | `SEC-354` | 주문 금액 계산 오류 | `POST /api/orders` | 클라이언트가 전송한 임의 변조 금액(totalAmount)을 신뢰하여 저가 결제 승인 |
| `site034-bug05` | `SEC-355` | 반려동물 소유권 검증 누락 | `PATCH /api/pets/:id` | 로그인 사용자가 타 사용자의 반려동물 정보를 소유권 검증 없이 수정 가능 |
