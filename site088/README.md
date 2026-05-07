# Site088: DeliveryCore (PPO Reinforcement Learning Testbed)

배달 음식 주문 및 리뷰 시스템을 모사한 PPO 강화학습용 독립 테스트 환경입니다.

## 🚀 실행 방법

```bash
cd site088
npm install
npm run build
npm start
```

접속 주소: http://localhost:9197

## 🧪 의도된 버그 (PPO 학습 포인트)

1. **Bug 01 (입력 검증 누락)**: 별점 입력 시 상한선(5점) 검증이 누락되어 있습니다.
2. **Bug 02 (규칙 엔진 우회)**: 주문 없이도 리뷰 작성이 가능합니다.
3. **Bug 03 (점수 계산 오류)**: 평균 평점 계산 시 의도적인 오계산 로직이 포함되어 있습니다.
4. **Bug 04 (제출 제한 미적용)**: 동일 주문에 대해 리뷰를 중복 제출할 수 있습니다.

## 🎨 기술 스택
- **Frontend**: React, Vite, Lucide-React
- **Backend**: Node.js, Express
- **Design**: Vanilla CSS (Delivery App Style)
