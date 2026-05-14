# TODO - site068 Music Academy

## 1. 프로젝트 기반 설정
- [x] `site068` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Lessons, Teachers)

## 2. 디자인 및 레이아웃 (딥 퍼플 & 골드 테마)
- [x] 클래식한 음악 학원 브랜드 스타일 가이드 정의
- [x] 히어로 섹션 및 2컬럼(레슨-요약) 메인 레이아웃 구현
- [x] 악기별 레슨 카드 및 강사 프로필 디자인
- [x] 수강료 아코디언 및 상담 신청 폼 제작
- [x] 강사 상세 정보 모달 UI 완성

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 레슨/강사 정보 동적 렌더링
- [x] 악기별 레슨 필터링 로직 구현
- [x] 상담 예약 선택 및 실시간 요약 패널 연동
- [x] 강사 모달 오픈 및 데이터 바인딩
- [x] 수강료 아코디언 인터랙션

## 4. 의도된 GUI 오류 주입
- [x] `site068-bug01`: 타입 불일치로 인한 강사명 `undefined` 노출 오류 (app.js)
- [x] `site068-bug02`: 특정 폭(1100px-1280px)에서 네비게이션 겹침 레이아웃 오류 (styles.css)
- [x] `site068-bug03`: 특정 레슨(바이올린) 상담 버튼 이벤트 누락 오류 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 `INTENTIONAL GUI BUG` 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 및 `README.md` 작성 완료
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
