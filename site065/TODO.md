# TODO - site065 Laundry Appointment

## 1. 프로젝트 기반 설정
- [x] `site065` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Items, Slots)

## 2. 디자인 및 레이아웃 (Clean Blue 테마)
- [x] 클린 블루 & 화이트 기반의 생활 서비스 UI 스타일 정의
- [x] 히어로 섹션 및 메인 예약 폼 레이아웃 구현
- [x] 세탁 품목 그리드 및 사이드바 요약 패널 디자인
- [x] 가격표 아코디언 및 이용 가이드 구현
- [x] 예약 완료 확인 모달 제작

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 품목/날짜 슬롯 동적 렌더링
- [x] 품목 선택 토글 및 실시간 요약 리스트 연동
- [x] 날짜 선택에 따른 시간 슬롯 동적 변경 로직
- [x] 가격표 아코디언 인터랙션
- [x] 미구현 기능에 대한 alert 연동

## 4. 의도된 GUI 오류 주입
- [x] `site065-bug01`: 마지막 선택 품목 누락으로 인한 예상 금액 불일치 오류 (app.js)
- [x] `site065-bug02`: 특정 폭(1024px-1200px)에서 예약 폼 겹침 레이아웃 오류 (styles.css)
- [x] `site065-bug03`: 버튼 ID 불일치로 인한 수거 예약 버튼 무반응 오류 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 `INTENTIONAL GUI BUG` 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 및 `README.md` 작성 완료
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
