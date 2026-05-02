# TODO.md — site080 RoomMate Board

## 프로젝트 설정

- [x] site080 폴더 생성
- [x] package.json 작성 (start, dev, build 스크립트 포함)
- [x] Express 서버 구성 (port 9409)
- [x] public/ 디렉터리 구조 생성
- [x] npm install 후 npm start 실행 가능

## API 엔드포인트

- [x] GET /api/health
- [x] GET /api/posts (region, gender, roomType, q, sort 필터)
- [x] GET /api/posts/:id
- [x] POST /api/posts
- [x] GET /api/applications
- [x] POST /api/applications
- [x] GET /api/messages
- [x] GET /api/messages/:threadId
- [x] GET /api/my-posts
- [x] GET /api/regions

## 의도된 오류 구현

- [x] bug01 — DB 게시글 상태 오류 (database-state) — getPostStatus_buggy(): isClosed 무시, 항상 'open' 반환
- [x] bug02 — 네트워크 응답 지연 처리 실패 (network-timeout) — POST /api/applications 4초 인위적 지연
- [x] bug03 — 개인 메시지 접근 제어 실패 (security-idor) — GET /api/messages/:threadId 참여자 검증 없음
- [x] 각 오류 코드 바로 위에 INTENTIONAL BUG 주석 작성
- [x] 각 오류 위치에 data-bug-id 속성 부착

## 프론트엔드 구현

- [x] 섹션 1: 게시판 (Hero, 필터 바, 게시글 그리드)
- [x] 섹션 2: 글쓰기 폼 (게시글 작성)
- [x] 섹션 3: 내 게시글 + 받은 신청 목록
- [x] 섹션 4: 메시지 (스레드 목록 + 대화창 + IDOR 디버그 패널)
- [x] 상세 모달 (상세정보/생활패턴/신청 탭)

## 인터랙션 구현 (14개)

- [x] 게시글 검색 (키워드)
- [x] 지역 필터 (칩 선택)
- [x] 성별 필터 (select)
- [x] 방 유형 필터 (select)
- [x] 정렬 (최신/조회/월세)
- [x] 게시글 카드 클릭 → 상세 모달
- [x] 모달 탭 전환 (상세/생활패턴/신청)
- [x] 신청 폼 제출
- [x] 게시글 작성 폼 제출
- [x] 내 게시글 조회
- [x] 메시지 스레드 열기
- [x] IDOR 디버그 threadId 직접 조회
- [x] 헤더 새로고침 버튼
- [x] 모달 닫기 (✕, ESC, 오버레이)

## 문서화

- [x] README.md 작성
- [x] BUGS.md 작성
- [x] TODO.md 작성

## 미완료 / 향후 개선 사항

- [ ] 실제 사용자 인증 시스템
- [ ] 메시지 참여자 검증 수정 (bug03 픽스)
- [ ] 게시글 상태 정확한 반환 (bug01 픽스)
- [ ] 신청 API 타임아웃 처리 (bug02 픽스)
- [ ] 실시간 메시지 (WebSocket)
- [ ] 사진 첨부 기능
- [ ] 신청 수락/거절 기능
- [ ] 지도 연동 (카카오맵)
