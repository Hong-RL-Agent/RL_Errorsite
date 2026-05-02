# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site009`)
- [x] `package.json` 생성 및 Express 의존성 추가
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 서버 기본 설정 (포트 9338)
- [x] `/api/health` 엔드포인트 구현
- [x] 목업 데이터 설정 (친환경 상품, 쿠폰, 주문내역 등)
- [x] `/api/items` 상품 조회 로직
- [x] `/api/coupons/apply` 쿠폰 조회/적용 처리 로직
- [x] `/api/orders` 주문 생성 및 조회 로직
- [x] **[BUG]** `site009-bug01` DB 만료 쿠폰 검증 누락
- [x] **[BUG]** `site009-bug02` 네트워크 오류 메시지 누락 (빈 응답 바디 500 에러)
- [x] **[BUG]** `site009-bug03` 파라미터 가격 조작 취약점 (클라이언트 전송액 무조건 신뢰)

## Frontend (public/)
- [x] `index.html` 주요 6개 섹션 레이아웃 구성
- [x] `css/style.css` 어스 톤(Olive Green/Warm Beige) 자연주의 테마 디자인 적용
- [x] `js/app.js` 상품 정렬, 쿠폰 적용, 결제 모의 등 비동기 통신 로직
- [x] 10개 정상 인터랙션 (장바구니 렌더링, 탭 전환, 주문 내역 갱신 등) 구현
- [x] 취약점 유발을 위한 금액 조작 입력칸, 만료 쿠폰 번호 가이드 적용
- [x] 취약점 발생 요소에 `data-bug-id` 어트리뷰트 연결 완료

## Testing & Verification
- [ ] `npm install` 패키지 설치
- [ ] `npm start` 포트 9338 서버 구동 확인
- [ ] 10개 정상 작동 인터랙션 수동 테스트
- [ ] 3개 의도적 버그(만료 쿠폰 통과, 500 에러 빈 응답, 금액 100원 결제) 수동 재현 확인
