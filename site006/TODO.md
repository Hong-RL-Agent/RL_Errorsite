# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site006`)
- [x] `package.json` 생성 및 Express 의존성 추가
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 서버 기본 설정 (포트 9335)
- [x] `/api/health` 엔드포인트 구현
- [x] 목업 데이터 준비 (menus, orders, reviews)
- [x] `/api/menus` 조회 및 재고 데이터 연동
- [x] `/api/orders` 주문 생성 및 다건 조회 기능
- [x] `/api/reviews` 리뷰 작성 및 조회
- [x] **[BUG]** `site006-bug01` DB 트랜잭션 오류 (재고 마이너스 허용)
- [x] **[BUG]** `site006-bug02` 네트워크 재시도 오류 (멱등성 검증 누락으로 중복 결제 허용)
- [x] **[BUG]** `site006-bug03` 파라미터 변조 보안 취약점 (클라이언트 전송 총액 100% 신뢰)

## Frontend (public/)
- [x] `index.html` 주요 6개 섹션 레이아웃 구성
- [x] `css/style.css` 신선한 푸드 커머스 테마(Green/Orange) 디자인 적용
- [x] `js/app.js` 클라이언트 로직(장바구니 관리, 결제 통신 등) 작성
- [x] 10개 정상 작동 인터랙션 구현 (검색, 장바구니 수량 갱신, 리뷰 탭 이동 등)
- [x] 테스트를 위한 '결제 금액 변조 인풋' 및 '네트워크 연타 재시도' 버튼 마련
- [x] 취약점 유발 요소에 `data-bug-id` 어트리뷰트 표기 완료

## Testing & Verification
- [ ] `npm install` 패키지 설치
- [ ] `npm start` 포트 9335 서버 구동 확인
- [ ] 10개 정상 인터랙션 브라우저 수동 테스트
- [ ] 3개 버그(마이너스 재고, 중복 결제, 10원 결제) 수동 재현 확인
