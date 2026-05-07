# site082 - 쇼핑몰 추천 상품 & UI 실험 플랫폼

PPO 강화학습 에이전트의 실험군 할당 정합성 및 세그먼트 매칭 오류 탐지 훈련을 위한 테스트베드입니다.

## 🚀 프로젝트 정보
- **포트**: 9191
- **기술 스택**: React, Vite, Express
- **핵심 목표**: 불안정한 A/B 테스트 할당 및 롤아웃 계산 오류 탐지

## 📡 API 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/products`: 전체 상품 목록 조회
- `GET /api/recommendations?userId=1&userType=new`: 개인화 추천 상품 조회 (Bug 01, 03, 04 관련)
- `POST /api/experiments`: 실험 설정 업데이트 (Bug 03 관련)
- `GET /api/experiments/stats`: 실험 롤아웃 통계 조회 (Bug 02 관련)
- `GET /api/dashboard/summary`: 운영 대시보드 요약
- `GET /api/logs`: 시스템 로그 조회

## ❗ 의도된 오류 (4개)
1. **site082-bug01 (unstable-assignment)**: 동일 사용자에게 매번 다른 추천 상품 제공
2. **site082-bug02 (rollout-percentage-miscalculation)**: 실험군 노출 비율 계산 오류 (30% -> 75%)
3. **site082-bug03 (flag-cache-inconsistency)**: 실험 설정 변경 시 즉시 반영 실패
4. **site082-bug04 (segment-matching-error)**: 세그먼트 필터링 무시 (전체 사용자 적용)

## 🛠️ 실행 방법
```bash
cd site082
npm install
npm start
```
접속: http://localhost:9191
