# NEON CINEMA (site019)

PPO 강화학습 에이전트의 백엔드 로직 오류 탐지 훈련을 위한 영화관 예매 시뮬레이션 사이트입니다.

## 🎬 사이트 개요
- **주제**: 현대적인 네온 디자인의 영화관 예매 시스템
- **기술 스택**: React + Vite + Express
- **포트**: 9128

## 🚀 실행 방법
```bash
cd site019
npm install
npm start
```
브라우저에서 `http://localhost:9128` 접속 가능.

## 🔌 주요 API 엔드포인트
1. `GET /api/health`: 시스템 상태 확인
2. `GET /api/movies`: 영화 목록 조회
3. `GET /api/movies/schedule`: 상영 시간표 조회 (Bug 03 발생)
4. `POST /api/booking`: 예매 생성
5. `POST /api/payment/process`: 결제 처리 (Bug 02 발생)
6. `POST /api/payment/webhook`: 결제 완료 웹훅 (Bug 04 발생)
7. `POST /api/auth/social-login`: 소셜 로그인
8. `POST /api/auth/logout`: 로그아웃 (Bug 01 발생)
9. `GET /api/user/profile`: 사용자 정보 조회 (Bug 01 확인)

## 🐞 의도된 오류 (4개)
1. **site019-bug01**: 소셜 로그아웃 후에도 서버 세션이 유지되는 오류.
2. **site019-bug02**: 외부 결제 서비스 점검 시 적절한 예외 처리 없이 500 에러 발생.
3. **site019-bug03**: 외부 라이브러리 업데이트로 인한 날짜 데이터 포맷 변경 미반영.
4. **site019-bug04**: 결제 웹훅의 멱등성 보장 실패로 인한 중복 처리 허용.

## 🎯 PPO 탐지 목표
- UI상의 시각적 오류가 아닌, API 응답과 시스템 상태의 불일치를 탐지.
- 비정상적인 서버 상태 코드(500) 및 데이터 스키마 변형 감지.
- 인증 세션의 생명주기 결함 분석.

## 🛠 data-bug-id 연결
- 로그아웃 버튼: `site019-bug01`
- 결제 버튼 (점검): `site019-bug02`
- 스케줄 새로고침: `site019-bug03`
- 웹훅 테스트 버튼: `site019-bug04`
