# TODO List - site011

## 실행 여부
- [x] 서버 및 프론트엔드 빌드 실행 완료 (상태: 확인 및 완료)

## 의도된 백엔드 입력 검증 오류 (Reflected XSS)
- [x] site011-bug01 (SEC-101) - 로그인 폼 username 반사형 XSS (확인 및 완료)
- [x] site011-bug02 (SEC-102) - 회원가입 폼 nickname 반사형 XSS (확인 및 완료)
- [x] site011-bug03 (SEC-103) - 배송 주소 입력란 address 반사형 XSS (확인 및 완료)
- [x] site011-bug04 (SEC-104) - 쿠폰 적용 couponCode 반사형 XSS (확인 및 완료)
- [x] site011-bug05 (SEC-105) - 정렬 옵션 sort 파라미터 반사형 XSS (확인 및 완료)
- [x] site011-bug06 (SEC-106) - 페이지 번호 page 파라미터 반사형 XSS (확인 및 완료)
- [x] site011-bug07 (SEC-107) - 업로드 파일명 filename 반사형 XSS (확인 및 완료)
- [x] site011-bug08 (SEC-108) - 채팅 입력 message 반사형 XSS (확인 및 완료)
- [x] site011-bug09 (SEC-109) - 공지사항 검색 keyword 반사형 XSS (확인 및 완료)
- [x] site011-bug10 (SEC-110) - 상품 리뷰 content 반사형 XSS (확인 및 완료)

## 필수 정상 기능 구현
- [x] 사용자 역할 전환 (Customer / Seller / Admin)
- [x] 메인화면 (대형 배너, 추천 상품, 오늘의 룩북 등)
- [x] 로그인 / 회원가입 양식 미리보기 및 실제 완료 처리
- [x] 상품 목록 정렬 / 검색 / 페이지네이션 및 로딩/에러/빈 상태 구현
- [x] 장바구니 추가 및 쿠폰 적용 연동 (실제 가격 차감 처리)
- [x] 배송지 입력 미리보기 및 주문 완료 처리
- [x] 상품 이미지 및 파일 업로드 시뮬레이션 및 업로드 미리보기
- [x] 공지사항 검색 및 결과 출력
- [x] 고객센터 실시간 채팅 상담 입력 및 추가
- [x] 상품 리뷰 작성 미리보기 및 목록 등록 추가
- [x] 개발자 설정 모드 (Dev Mode) 및 보안 필터 스위치 (Safe Mode) 구현
