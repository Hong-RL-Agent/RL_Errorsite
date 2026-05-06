# TODO - site069 Legal Consultation

## 1. 프로젝트 기반 설정
- [x] `site069` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Lawyers, Consultation-Types)

## 2. 디자인 및 레이아웃 (네이비 & 골드 테마)
- [x] 신뢰감 있는 법률 브랜드 스타일 가이드 정의
- [x] 히어로 섹션 및 2컬럼(본문-요약) 메인 레이아웃 구현
- [x] 분야별 필터 칩 및 변호사 프로필 카드 디자인
- [x] 상담 유형 선택 리스트 UI 제작
- [x] FAQ 아코디언 및 요약 패널 UI 완성

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 변호사/상담유형 정보 동적 렌더링
- [x] 상담 분야별 필터링 로직 구현
- [x] 상담 예약 선택(변호사, 유형) 및 요약 갱신 기능
- [x] 변호사 상세 정보 모달 연동
- [x] FAQ 아코디언 토글 인터랙션

## 4. 의도된 GUI 오류 주입
- [x] `site069-bug01`: 상담 유형 선택 시 요약 패널 미갱신 상태 오류 (app.js)
- [x] `site069-bug02`: FAQ 답변 영역 고정 높이로 인한 텍스트 잘림 레이아웃 오류 (styles.css)
- [x] `site069-bug03`: 특정 변호사(강소라) 예약 버튼 이벤트 누락 오류 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 `INTENTIONAL GUI BUG` 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 및 `README.md` 작성 완료
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
