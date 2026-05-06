# TODO - site057 Remote Work Recruitment

## 1. 프로젝트 기반 설정
- [x] `site057` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Jobs, Companies)

## 2. UI 및 디자인 (Modern Recruitment SaaS)
- [x] 화이트 & 인디고 테마의 현대적인 채용 사이트 레이아웃 설계
- [x] 히어로 섹션 및 직무/원격 필터 사이드바 구현
- [x] 채용 공고 카드 그리드 및 상세 정보 모달 디자인
- [x] 우측 지원 현황 및 인기 기업 리스트 스타일링

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 공고/기업 리스트 렌더링
- [x] 키워드 검색 및 다중 필터(직무, 원격 유형) 연동
- [x] 채용 공고 상세 정보 모달 연동
- [x] 회사 저장(즐겨찾기) 버튼 토글 로직
- [x] 미구현 기능에 대한 "준비 중입니다" alert 연동

## 4. 의도된 GUI 오류 주입
- [x] `site057-bug01`: 필터 결과 수 배지 불일치 상태 오류 구현 (app.js)
- [x] `site057-bug02`: 그리드 카드 최소 너비 과다로 인한 레이아웃 깨짐 구현 (styles.css)
- [x] `site057-bug03`: 특정 공고 지원 버튼 무반응 이벤트 오류 구현 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 작성 및 오류 명세 기록
- [x] `README.md` 작성 및 프로젝트 안내
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
