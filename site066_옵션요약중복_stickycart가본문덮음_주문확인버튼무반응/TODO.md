# TODO - site066 Lunchbox Order

## 1. 프로젝트 기반 설정
- [x] `site066` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Boxes, Nutrition)

## 2. 디자인 및 레이아웃 (푸드 커머스 테마)
- [x] 라임 그린 & 오렌지 기반의 신선한 푸드 스타일 가이드 정의
- [x] 히어로 배너 및 3컬럼(필터-상품-카트) 메인 레이아웃 구현
- [x] 도시락 상품 카드 및 수량 조절 인터페이스 디자인
- [x] 영양 정보 상세 모달 및 정기 배송 아코디언 제작

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 도시락/영양 정보 동적 렌더링
- [x] 식단 유형, 칼로리, 텍스트 검색 필터 로직 구현
- [x] 수량 변경 및 실시간 장바구니 합산 기능
- [x] 추가 옵션 선택 및 요약 표시 기능
- [x] 미구현 버튼에 대한 alert 연동

## 4. 의도된 GUI 오류 주입
- [x] `site066-bug01`: '밥 적게' 옵션 중복 렌더링 오류 (app.js)
- [x] `site066-bug02`: Sticky Cart 패널의 중앙 콘텐츠 침범 레이아웃 오류 (styles.css)
- [x] `site066-bug03`: 버튼 ID 불일치로 인한 주문 확인 버튼 무반응 오류 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 `INTENTIONAL GUI BUG` 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 및 `README.md` 작성 완료
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
