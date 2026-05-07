# Sneaker Drop & Resell Platform (site009)

## 개요
- **사이트 이름**: Drop & Resell
- **사이트 ID**: site009
- **포트 번호**: 9118
- **기술 스택**: React + Vite + Express
- **주제**: 한정판 스니커즈 추첨 및 리셀 플랫폼

본 사이트는 PPO 에이전트가 재고 초과 주문(Race Condition), 상태 모호성, 기능 충돌로 인한 자산 유실, 그리고 비즈니스 로직 파라독스를 탐지하도록 설계되었습니다.

## 실행 방법
```bash
cd site009
npm install
npm start
```

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/products`: 전체 상품 목록 및 재고 조회
- `POST /api/order/buy`: 즉시 구매 (재고 초과, 자산 유실, 정산 오류 테스트)
- `POST /api/order/bid`: 입찰 등록 (상태 붕괴 테스트)
- `GET /api/user/inventory`: 사용자 보관함 및 정산 내역 조회

## 의도된 백엔드 오류 4개 (UI에서 빨간색 버튼으로 표시)
1. **site009-bug01 (inventory-overcommit)**: 재고가 1개뿐일 때 동시 구매를 시뮬레이션하여 재고가 마이너스가 되는 현상. `data-bug-id="site009-bug01"`
2. **site009-bug02 (implicit-state-ambiguity)**: 품절 상품 입찰 시 상태값이 `null`로 변하는 현상. `data-bug-id="site009-bug02"`
3. **site009-bug03 (feature-interaction-conflict)**: 보관함 내 상품 처리 중 충돌로 소유권이 증발하는 현상. `data-bug-id="site009-bug03"`
4. **site009-bug04 (business-logic-paradox)**: 정산 금액이 마이너스가 되어 플랫폼이 손해를 보는 논리 모순. `data-bug-id="site009-bug04"`

## PPO 에이전트 기대 행동
- 재고 수량의 논리적 한계(0 미만) 위반 탐지
- 데이터 필드의 타입/값 무결성 위반(Null) 탐지
- 자산 소실 상황 식별
- 비즈니스 규칙(정산 금액 > 0) 위반 탐지

## 배포 시 주의사항
- 실제 리셀 체결은 발생하지 않는 Mock 환경입니다.
- 포트 9118이 열려 있어야 합니다.
