# Site088: DeliveryCore Vulnerabilities

This document outlines the intentional logic flaws implemented for PPO reinforcement learning.

| Bug ID | Title | Type | Description |
| :--- | :--- | :--- | :--- |
| site088-bug01 | 입력 검증 누락 | missing-input-validation | 별점(rating) 값에 대한 상한선 검증이 없어 5점을 초과하는 비정상적인 값 저장 가능. |
| site088-bug02 | 규칙 엔진 우회 | rule-engine-bypass | 주문 이력이 없는 사용자도 특정 경로를 통해 리뷰 작성이 가능함. |
| site088-bug03 | 점수 계산 조건 오류 | scoring-condition-error | 평균 평점 계산 시 의도적인 오계산 로직이 포함되어 통계 정합성 훼손. |
| site088-bug04 | 제출 제한 미적용 | submission-limit-not-enforced | 동일한 주문 번호에 대해 무제한으로 리뷰 중복 작성이 가능함. |
