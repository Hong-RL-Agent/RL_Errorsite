# TableLoop (site033) - Local Food Subscription & Community Platform

**TableLoop (`site033`)**은 지역 농가와 소비자를 연결하는 지역 식재료 정기 구독 및 파머스 커뮤니티 플랫폼입니다.

본 사이트는 PPO(Proximal Policy Optimization) 기반 강화학습 에이전트가 실제 서비스 환경과 유사한 조건에서 다양한 사용자 행동과 API 요청을 탐색하며 **5가지 주요 비즈니스 로직 결함(총 10개 취약점)**을 동적으로 탐지할 수 있도록 구축된 학습용 웹 애플리케이션입니다.

---

## 1. 프로젝트 기본 정보

- **Site ID**: `site033`
- **Port**: `9932`
- **서비스명**: TableLoop
- **테마 & 콘셉트**: 지역 식재료 정기 구독 및 농가 커뮤니티 (Local Food Subscription & Community Platform)
- **디자인 팔레트**: Forest Green (`#1b4332`), Sage Green (`#52b788`), Soft Orange (`#e76f51`), Warm Beige (`#f4ede4`), Cream White (`#ffffff`)
- **기술 스택**: React 18, Vite, Express, Vanilla CSS Design System, Lucide React Icons

---

## 2. 주요 서비스 기능

1. **지역 농가 탐색 (Farmers)**: 전국 8대 친환경 농가 프로필, 지역/특산물 정보, 관심 농가 등록/해제
2. **제철 식재료 마켓 (Market)**: 20개 로컬 식재료 카탈로그, 카테고리 필터링(채소, 과일, 유제품, 수제/가공식품 등), 잔여 재고 표시
3. **정기 구독 시스템 (Subscriptions)**: 맞춤형 주기(매주, 격주, 매월) 배송 신청, 구독 상태 관리(Active, Paused, Cancelled), 회차별 배송 조회
4. **장바구니 & 간편 결제 (Cart & Orders)**: 장바구니 수량 조절, 로컬 포인트 사용 결제, 주문 상세 및 배송 이력 관리
5. **배송지 주소록 (Addresses)**: 기본 배송지 설정, 배송지 추가/수정/삭제
6. **친환경 리워드 포인트 (Points)**: 회원가입, 리뷰 작성 리워드 적립 및 주문 결제 시 차감/할인 내역 관리
7. **파머스 & 레시피 커뮤니티 (Community)**: 농가 소식, 제철 요리 레시피 공유, 좋아요 및 댓글 소통
8. **식재료 리뷰 시스템 (Reviews)**: 별점 및 사진/텍스트 리뷰 작성, 상품 평점 자동 갱신

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

### Express 서버 실행 (Port: 9932)
```bash
npm start
```

### 헬스체크 확인
```bash
curl http://localhost:9932/api/health
```

---

## 4. 구현된 10대 비즈니스 로직 결함 개요

| Bug ID | CSV ID | 취약점 유형 | 발생 API | 설명 |
|---|---|---|---|---|
| `site033-bug01` | `SEC-331` | 재고 차감 동시성 처리 오류 | `POST /api/orders` | 재고 확인 및 차감이 원자적으로 처리되지 않아 초과 주문 발생 |
| `site033-bug02` | `SEC-332` | 장바구니 수량 검증 오류 | `PATCH /api/cart/items/:id` | 실제 재고를 초과하는 수량이 장바구니에 유효성 검증 없이 반영됨 |
| `site033-bug03` | `SEC-333` | 구독 상태 전이 검증 누락 | `POST /api/subscriptions/:id/resume` | 이미 해지된(cancelled) 구독이 검증 없이 active 상태로 재개됨 |
| `site033-bug04` | `SEC-334` | 해지된 구독의 배송 생성 오류 | `POST /api/subscriptions/:id/shipments` | 해지 상태의 구독에 대해 새로운 배송 데이터가 생성됨 |
| `site033-bug05` | `SEC-335` | 포인트 잔액 검증 오류 | `POST /api/orders` | 보유 포인트를 초과하는 포인트 사용이 승인되어 잔액이 마이너스가 됨 |
| `site033-bug06` | `SEC-336` | 포인트 중복 사용 처리 오류 | `POST /api/points/redeem` | 동일 redemptionId 요청이 중복 차감 방지 없이 다중 처리됨 |
| `site033-bug07` | `SEC-337` | 배송지 소유권 검증 누락 | `PATCH /api/addresses/:id` | 로그인 사용자가 타 사용자의 배송지 주소를 수정/삭제할 수 있음 |
| `site033-bug08` | `SEC-338` | 기본 배송지 중복 설정 오류 | `POST /api/addresses/:id/set-default` | 신규 기본 배송지 설정 시 기존 기본 배송지가 해제되지 않아 다중 기본 주소 발생 |
| `site033-bug09` | `SEC-339` | 구매 이력 검증 누락 | `POST /api/products/:id/reviews` | 실제 구매 및 배송 이력이 없는 상품에 대해 리뷰 작성이 허용됨 |
| `site033-bug10` | `SEC-340` | 리뷰 작성 횟수 제한 검증 오류 | `POST /api/products/:id/reviews` | 동일 주문/상품 건에 대해 중복 리뷰가 무제한 작성됨 |
