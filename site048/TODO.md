# TODO - site048 Cleaning Service Reservation

## 1. 환경 설정 및 초기화
- [x] 프로젝트 폴더 생성 (`site048`)
- [x] `package.json` 초기화 및 의존성 설정
- [x] Express 서버(`server.js`) 기본 구조 작성

## 2. 백엔드 구현 (API)
- [x] `/api/health` 엔드포인트 구현
- [x] `/api/services` 서비스 목록 API 구현
- [x] `/api/time-slots` 예약 가능 시간표 API 구현

## 3. 프론트엔드 디자인 및 레이아웃
- [x] `public/index.html` 시멘틱 HTML 구조 작성
- [x] `public/styles.css` 현대적인 민트/네이비 디자인 적용
- [x] 3단 레이아웃(폼/콘텐츠/요약) 구현 및 Sticky 패널 설정
- [x] Hero 섹션 및 고해상도 이미지 적용

## 4. 프론트엔드 인터랙션 (Vanilla JS)
- [x] 서비스 목록 데이터 페칭 및 렌더링
- [x] 예약 시간표 동적 생성 및 선택 로직
- [x] 견적 요약 실시간 업데이트 (서비스, 면적, 옵션)
- [x] FAQ 아코디언 인터랙션

## 5. 의도된 GUI 오류 주석 및 구현
- [x] `site048-bug01`: 선택 옵션 표시 오류 (app.js)
- [x] `site048-bug02`: 폼 컬럼 깨짐 (styles.css)
- [x] `site048-bug03`: 견적 계산 버튼 무반응 (app.js)
- [x] 각 오류 위치에 `data-bug-id` 부여 및 `INTENTIONAL GUI BUG` 주석 작성

## 6. 최종 점검 및 문서화
- [x] `BUGS.md` 작성
- [x] `README.md` 작성
- [x] `npm start`를 통한 로컬 실행 확인 및 브라우저 테스트
- [x] 콘솔 에러 최소화 확인 (의도된 경고 제외)
