# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site010`)
- [x] `package.json` 생성 및 의존성 주입
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 구동 환경 세팅 (포트 9339)
- [x] `/api/health` 핑 엔드포인트 세팅
- [x] 데이터 목업 (곡, 플레이리스트, 사용자, 최근 재생 목록 등)
- [x] `/api/songs`, `/api/artists`, `/api/recent` 조회 로직
- [x] `/api/playlists` 리스트 및 상세 조회
- [x] **[BUG]** `site010-bug01` DB 외래키 연관관계 매핑 오류
- [x] **[BUG]** `site010-bug02` 네트워크 응답 객체 부분 손상
- [x] **[BUG]** `site010-bug03` 보안 인가(Authorization) 부재 및 IDOR 취약점

## Frontend (public/)
- [x] `index.html` 메뉴 및 메인 뷰(탐색, 홈, 보관함) 구성, 플레이어 바 레이아웃 추가
- [x] `css/style.css` 다크 바이올렛/네온 블루 사이버틱 퓨처 디자인
- [x] `js/app.js` 플레이어 연동, 곡 리스트 렌더링 등 SPA 구현
- [x] 최소 10개 정상 인터랙션 구현 완료
- [x] 테스트 패널(사이드바) 추가 - 데이터 손상 토글, 비공개 리소스 침투 버튼
- [x] 취약점 유발 요소에 `data-bug-id` 어트리뷰트 연결 완료

## Testing & Verification
- [ ] `npm install` 설치 진행
- [ ] `npm start` 포트 9339 서버 자동 구동
- [ ] 10개 정상 인터랙션(플리 모달, 재생 시뮬레이션, 하트 찜, 필터링) 수동 동작 검증
- [ ] 3개 에러(최근 곡 섞임, undefined 제목, 비공개 플리 노출) 렌더링 확인
