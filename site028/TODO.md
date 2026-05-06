# TODO — site028 PremiRide 자동차 렌트

## 생성 진행
- [x] 프로젝트 폴더 생성 (site028/)
- [x] package.json 작성 (React + Vite + Express + concurrently)
- [x] vite.config.js 작성 (React plugin, /api proxy)
- [x] index.html 작성 (Google Fonts, root div)
- [x] Express 서버 작성 (server.js, 포트 9247)
- [x] API 엔드포인트 작성 (/api/health, /api/cars, /api/insurance-options)
- [x] React 엔트리 작성 (src/main.jsx)
- [x] App.jsx 작성 (전체 상태 관리, fetch 로직)
- [x] Header.jsx 작성 (로고, 네비게이션, 모바일 토글)
- [x] RentHero.jsx 작성 (hero 섹션, CTA, 통계)
- [x] SearchPanel.jsx 작성 (픽업/반납 위치, 날짜 입력)
- [x] CarFilters.jsx 작성 (차량 유형 + 연료 필터 pill 버튼)
- [x] CarGrid.jsx 작성 (차량 카드 그리드, 정렬)
- [x] CarCard.jsx 작성 (브랜드 컬러, 평점, 예약 버튼)
- [x] CarModal.jsx 작성 (차량 상세, 사양, 편의 기능)
- [x] InsuranceOptions.jsx 작성 (보험 3종 카드)
- [x] BookingSummary.jsx 작성 (sticky 예약 요약 패널)
- [x] RecommendationCarousel.jsx 작성 (추천 차량 캐러셀)
- [x] Footer.jsx 작성 (보험/렌트조건/지점/고객센터)
- [x] global.css 작성 (변수, 헤더, 히어로, 검색패널, 레이아웃)
- [x] cars.css 작성 (필터, 그리드, 카드, 모달)
- [x] booking.css 작성 (보험, 요약패널, 캐러셀, 푸터)
- [x] responsive.css 작성 (반응형 + bug02 레이아웃 오류)
- [x] 의도된 GUI 오류 3개 삽입 (bug01, bug02, bug03)
- [x] data-bug-id 속성 삽입 (실제 DOM에서 확인 가능)
- [x] INTENTIONAL GUI BUG 주석 삽입 (각 오류 코드 바로 위)
- [x] README.md 작성
- [x] BUGS.md 작성

## 검증 진행
- [x] npm install 확인
- [x] npm run build 확인 (Vite 빌드 성공)
- [x] npm start 확인 (Express 서버 포트 9247 실행)
- [x] 브라우저 접속 확인 (http://localhost:9247)
- [x] /api/health 응답 확인
- [x] /api/cars 응답 확인 (12개 차량)
- [x] /api/insurance-options 응답 확인 (3종)
- [x] 차량 유형 필터 정상 동작 확인 (SUV 4대 등 API 필터 응답 정상)
- [ ] 연료 유형 필터 정상 동작 확인
- [ ] 차량 상세 모달 열기/닫기 확인
- [ ] 의도된 오류 site028-bug01 화면 확인
- [ ] 의도된 오류 site028-bug02 화면 확인 (900~1100px)
- [ ] 의도된 오류 site028-bug03 화면 확인
- [ ] 의도되지 않은 콘솔 오류 없음 확인

## 배포 진행
- [ ] 배포 설정 검토
- [ ] 배포 실행
- [ ] 배포 URL 확인
- [ ] 배포 후 오류 3개 재확인
