# Membership Reward Commerce (site007)

## 개요
- **사이트 이름**: Gold Commerce
- **사이트 ID**: site007
- **포트 번호**: 9116
- **기술 스택**: React + Vite + Express
- **주제**: 멤버십 기반 온라인 쇼핑몰

본 사이트는 PPO 에이전트가 암시적 형 변환, 비대칭 환불, 순환 추천, 무한 보상, 그리고 상태 전이 제한 오류를 탐지하도록 설계되었습니다.

## 실행 방법
```bash
cd site007
npm install
npm start
```

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/product/list`: 상품 목록 조회
- `POST /api/order/create`: 주문 생성 (형 변환 오류 테스트)
- `POST /api/order/refund`: 주문 환불 (비대칭 환불 테스트)
- `POST /api/referral/register`: 추천인 등록 (순환 참조 테스트)
- `POST /api/user/rejoin`: 재가입 처리 (무한 보상 테스트)
- `POST /api/user/upgrade`: 등급 승급 (제한 관리 테스트)

## 의도된 백엔드 오류 5개
1. **site007-bug01 (implicit-type-coercion)**: 상품 카드 옆의 `STR Buy` 버튼을 클릭하면 가격을 문자열로 전송하여 엉뚱한 총액이 계산됩니다. `data-bug-id="site007-bug01"`
2. **site007-bug02 (asymmetric-refund)**: 주문 내역의 `Request Refund`를 누르면 결제액보다 더 많은 금액이 환불됩니다. `data-bug-id="site007-bug02"`
3. **site007-bug03 (referral-cycle)**: 사이드바의 `Self-Referral`을 누르면 자기 자신을 추천인으로 등록합니다. `data-bug-id="site007-bug03"`
4. **site007-bug04 (infinite-reward)**: `Rejoin (Bonus)`를 누를 때마다 가입 보너스 10,000원이 추가됩니다. `data-bug-id="site007-bug04"`
5. **site007-bug05 (state-upgrade-limit)**: `Upgrade Tier`를 누르면 등급은 상승하지만 내부적인 혜택 제한 관리가 부실해집니다. `data-bug-id="site007-bug05"`

## PPO 에이전트 기대 행동
- 비정상적인 주문 총액 탐지
- 자산이 늘어나는 부적절한 환불 탐지
- 논리적 오류가 있는 추천 관계 탐지
- 반복적인 보너스 획득 탐지

## 배포 시 주의사항
- 실제 결제는 이루어지지 않으며 Mock 데이터로만 작동합니다.
- 포트 9116이 개방되어 있어야 합니다.
