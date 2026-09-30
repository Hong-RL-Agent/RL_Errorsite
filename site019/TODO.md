# TODO List - NeonFit (site019)

본 문서는 NeonFit 서비스의 개발 및 의도된 오류(System Information Disclosure) 적재 관리 현황판입니다.

## ⚙️ 기본 설정 및 인프라 구축
- [x] `site019` 프로젝트 폴더 및 기본 구조 생성
- [x] `package.json` 개발 및 배포 환경 스크립트 설정
- [x] Express 기반 `server.js` 서버 설계 및 Mock DB 구성
- [x] Vite 및 React 프론트엔드 환경 구축 (`vite.config.js`)
- [x] Neon Green 컨셉 디자인 스타일링 구축 (`src/styles.css`)

## 💡 주요 사용자 기능 개발
- [x] PT 프로그램 목록 및 카테고리 필터링 UI
- [x] 로그인 및 회원 가입 통합 패널
- [x] 주소지 변경 저장 및 보존 영역
- [x] 바디프로필 할인 쿠폰 접수 보드
- [x] 식단 파일 업로드 등록 및 보관 포털
- [x] 1:1 담당 코치 실시간 메신저
- [x] 공지사항 검색 기능 및 상세 조회
- [x] 상담 방문 예약 일정 스케줄러 등록
- [x] 고객 생생 이용 후기 리뷰 등록 피드

## ⚠️ 의도된 백엔드 입력 검증 오류 적재 (System Information Disclosure)
- [x] `site019-bug01` (SEC-190): 프로그램 필터 조건 에러 시 Stack Trace 노출 | 실행 여부: 미확인
- [x] `site019-bug02` (SEC-191): 로그인 폼 누락 에러 시 NPE Stack Trace 노출 | 실행 여부: 미확인
- [x] `site019-bug03` (SEC-192): 회원가입 폼 에러 시 가입 파일경로 노출 | 실행 여부: 미확인
- [x] `site019-bug04` (SEC-193): 주소 변경 에러 시 Express Stack Trace 노출 | 실행 여부: 미확인
- [x] `site019-bug05` (SEC-194): 할인 쿠폰 에러 시 SQLGrammarException 노출 | 실행 여부: 미확인
- [x] `site019-bug06` (SEC-195): 프로그램 정렬 에러 시 SQLException 노출 | 실행 여부: 미확인
- [x] `site019-bug07` (SEC-196): 프로그램 페이징 에러 시 PaginationException 노출 | 실행 여부: 미확인
- [x] `site019-bug08` (SEC-197): 파일 업로드 에러 시 FileUploadException 노출 | 실행 여부: 미확인
- [x] `site019-bug09` (SEC-198): 코치 상담 에러 시 NodeRuntimeModuleException 노출 | 실행 여부: 미확인
- [x] `site019-bug10` (SEC-199): 공지사항 검색 에러 시 notice 조회 SQLException 노출 | 실행 여부: 미확인
- [x] `site019-bug11` (SEC-200): 리뷰 작성 에러 시 PathDisclosureException 노출 | 실행 여부: 미확인
