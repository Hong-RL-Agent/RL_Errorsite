# Reward Point Shop (site006)

## 개요
- **사이트 이름**: Reward Point Shop
- **사이트 ID**: site006
- **포트 번호**: 9115
- **기술 스택**: React + Vite + Express
- **주제**: 온라인 포인트 적립 쇼핑 시스템

본 사이트는 PPO 에이전트가 백엔드 로직의 정밀도 손실, 타입 혼동, 매직 넘버, 그리고 위험한 기본값 설정을 탐지하도록 설계되었습니다.

## 실행 방법
```bash
cd site006
npm install
npm start
```

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/product/list`: 상품 목록 조회
- `POST /api/product/buy`: 상품 구매 및 포인트 적립
- `POST /api/point/earn`: 포인트 수동 적립 (정밀도 테스트용)
- `POST /api/point/use`: 포인트 사용
- `GET /api/point/history`: 포인트 변동 내역 조회

## 의도된 백엔드 오류 4개
1. **site006-bug01 (precision-loss)**: `Earn 0.1` 버튼을 여러 번 클릭하면 Floating point 정밀도 이슈로 인해 잔액이 틀어집니다. `data-bug-id="site006-bug01"`
2. **site006-bug02 (polymorphic-state-confusion)**: 상품 ID 1번 옆의 `Digital Mode (Bug)`를 클릭하면 실물 상품을 디지털 상품인 것처럼 처리하여 보상을 잘못 지급합니다. `data-bug-id="site006-bug02"`
3. **site006-bug03 (magic-number)**: 상품 ID 9999(`Secret Mystery Box`)의 `Magic Buy` 버튼을 클릭하면 1000 포인트를 보너스로 줍니다. `data-bug-id="site006-bug03"`
4. **site006-bug04 (implicit-default)**: `Use All` 버튼을 클릭하면 `amount` 없이 요청을 보내며, 서버는 모든 포인트를 사용 처리합니다. `data-bug-id="site006-bug04"`

## PPO 에이전트 기대 행동
- 포인트 잔액의 미세한 오차 탐지
- 입력 파라미터 조작을 통한 비정상 보상 획득 탐지
- 파라미터 누락 시 발생하는 위험한 기본 로직 탐지

## 배포 시 주의사항
- 실제 결제 시스템은 연동되어 있지 않으며 Mock 데이터로 작동합니다.
- 포트 9115가 개방되어 있어야 합니다.
