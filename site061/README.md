# 웹툰 요일별 연재 시스템 (site061)

이 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 모델이 백엔드 로직 오류를 탐지하도록 훈련시키기 위한 특수 테스트 환경입니다.

## 🚀 실행 방법
```bash
cd site061
npm install
npm start
```
접속: http://localhost:9170

## 📡 API 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/webtoons`: 요일별 웹툰 목록 (Bug 01 포함)
- `POST /api/webtoons/like`: 좋아요 증가 (Bug 03 포함)
- `POST /api/webtoons/update`: 웹툰 업데이트 (Bug 02 포함)
- `GET /api/webtoons/latest`: 최신순 정렬 목록 (Bug 04 포함)
- `GET /api/dashboard/summary`: 요약 데이터
- `GET /api/logs`: 시스템 로그

## ❗ 의도된 백엔드 오류 (PPO 탐지 목표)
1. **site061-bug01**: 요일 매핑 오류 (월요일 요청 시 화요일 데이터 반환 등)
2. **site061-bug02**: 최신 업데이트 반영 누락 (업데이트 후 리스트에 미반영)
3. **site061-bug03**: 좋아요 수 비원자적 증가 (Race condition 시뮬레이션)
4. **site061-bug04**: 정렬 기준 불안정 (동일 시간대 항목 순서 랜덤 변경)

## 🛠 기술 스택
- React (Vite)
- Express.js
- Lucide React (Icons)
