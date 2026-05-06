# TODO - site051 Dessert Cafe

## 1. 프로젝트 초기화 및 환경 설정
- [x] `site051` 폴더 생성 및 `npm init` 완료
- [x] `package.json` 스크립트 및 `express` 의존성 설정
- [x] Express 서버(`server.js`) 기본 구조 및 API 엔드포인트 구현

## 2. 레이아웃 및 디자인 (Vanilla HTML/CSS)
- [x] 1440px 데스크톱 기준 3단 레이아웃(사이드바/그리드/요약) 설계
- [x] 딸기핑크 & 크림 테마 스타일 가이드 적용
- [x] Hero 섹션 및 시즌 메뉴 배너 구현
- [x] 장바구니 Sticky 패널 및 디저트 카드 컴포넌트 스타일링

## 3. 프론트엔드 로직 구현 (Vanilla JS)
- [x] `/api/desserts` 데이터 페칭 및 메뉴 그리드 렌더링
- [x] 카테고리별 필터링 및 메뉴 검색 기능 구현
- [x] 상품별 수량 조절 및 장바구니 추가 로직
- [x] `/api/pickup-slots` 연동 및 픽업 시간 선택 기능
- [x] 미구현 기능 클릭 시 "준비 중입니다" alert 연동

## 4. 의도된 GUI 오류 주입 및 확인
- [x] `site051-bug01`: 주문 요약 수량 합계 오계산 로직 추가 (app.js)
- [x] `site051-bug02`: 특정 폭에서 메뉴 그리드 overflow CSS 추가 (styles.css)
- [x] `site051-bug03`: 특정 디저트 주문 버튼 이벤트 누락 처리 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 부여 및 `INTENTIONAL GUI BUG` 주석 작성

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 상세 명세 작성
- [x] `README.md` 프로젝트 안내 작성
- [x] `npm start` 실행 및 전체 기능 테스트
- [x] 브라우저 상에서 의도된 오류 3개 발생 확인
