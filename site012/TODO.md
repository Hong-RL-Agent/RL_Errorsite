# TODO List - site012

## 실행 여부
- [ ] 서버 및 프론트엔드 빌드 실행 완료 (상태: 미확인)

## 의도된 백엔드 입력 검증 오류 (Reflected XSS)
- [ ] site012-bug01 (SEC-111) - 태그 입력 tag 반사형 XSS (미확인)
- [ ] site012-bug02 (SEC-112) - 초대 메시지 message 반사형 XSS (미확인)
- [ ] site012-bug03 (SEC-113) - 배송 메모 note 반사형 XSS (미확인)
- [ ] site012-bug04 (SEC-114) - 환불 사유 reason 반사형 XSS (미확인)
- [ ] site012-bug05 (SEC-115) - 검색 제안 q 반사형 XSS (미확인)
- [ ] site012-bug06 (SEC-116) - 알림 제목 title 반사형 XSS (미확인)
- [ ] site012-bug07 (SEC-117) - 캘린더 제목 title 반사형 XSS (미확인)
- [ ] site012-bug08 (SEC-118) - 리포트 필터 filter 반사형 XSS (미확인)
- [ ] site012-bug09 (SEC-119) - CSV 업로드 filename 반사형 XSS (미확인)
- [ ] site012-bug10 (SEC-120) - API Query q 반사형 XSS (미확인)

## 필수 정상 기능 구현
- [ ] 사용자 역할 전환 (Customer / Owner / Admin)
- [ ] 메인화면 (민트 배너, 추천 음식 카테고리, 주문 진행 상태 등)
- [ ] 음식 검색 및 자동완성 검색 제안 리스트 구현
- [ ] 태그 입력 및 미리보기 등록
- [ ] 친구 초대 링크 생성 및 초대장 메시지 미리보기
- [ ] 장바구니 및 배송 메모 입력 미리보기 및 실제 주문 연동
- [ ] 환불 신청 양식 사유 입력 미리보기 및 주문 내역 환불 승인
- [ ] 예약 주문 일정 등록 및 캘린더 요약 미리보기
- [ ] 점주 CSV 업로드 시뮬레이션 및 업로드 미리보기
- [ ] 점주 분석 리포트 필터 데이터 노출
- [ ] 점주 개발 API Query 콘솔 동작
- [ ] 알림 조회 기능
- [ ] 마이페이지 내 사용자 안심 입력 필터 (Safe Mode - HTML Escaping) 스위치 제공
