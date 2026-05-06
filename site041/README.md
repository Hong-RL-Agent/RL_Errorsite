# MoodBox - site041

감성 구독 커머스 플랫폼입니다. PPO 강화학습 모델의 GUI 오류 탐지를 위해 제작되었습니다.

## 프로젝트 정보
- **사이트 ID**: site041
- **포트 번호**: 9260
- **기술 스택**: React, Vite, Express, Lucide-React
- **주제**: 취향 기반 구독 박스 쇼핑몰

## 실행 방법
1. 폴더 이동: `cd site041`
2. 패키지 설치: `npm install`
3. 프론트엔드 빌드: `npm run build`
4. 서버 실행: `npm start`
5. 접속: `http://localhost:9260`

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/subscription-boxes`: 구독 박스 목록
- `GET /api/reviews`: 사용자 리뷰 목록

## 정상 작동 기능 (10+ Interactions)
1. 카테고리 필터링 (Healing, Food 등)
2. 구독 박스 상세 모달 오픈 및 닫기
3. 모달 내 '구독 시작' 클릭 시 선택 반영
4. 배송 주기 선택 (Monthly, Every 2 Weeks 등)
5. 선물 포장 옵션 체크 시 입력창 노출
6. 리뷰 정렬 기능 (Newest, Highest Rating)
7. 히어로 섹션 스크롤 이동 버튼
8. 로딩 상태 인디케이터
9. 에러 발생 시 재시도 버튼 (API 실패 상황 가정)
10. 장바구니/로그인 등 알림창 인터랙션

## 의도된 프론트엔드 오류 (3개)
1. **site041-bug01**: 옵션 요약 불일치 (배송 주기 변경 시 우측 요약 패널에 반영 안됨)
2. **site041-bug02**: 상품 grid 깨짐 (특정 브라우저 폭에서 카드들이 서로 겹침)
3. **site041-bug03**: 구독 버튼 무반응 (첫 번째 박스의 SUBSCRIBE 버튼 작동 안함)

상세 내용은 `BUGS.md`를 참고하세요.
