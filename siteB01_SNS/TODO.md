# TODO.md — Mingle (B-01)

범례: [x] 완료/확인됨, [ ] 미확인 또는 미완료. 지침에 따라 `npm install`, `npm run build`, 서버 실행은 하지 않았으므로 **실행이 필요한 검증은 완료 처리하지 않았다.**

## 개발 완료 여부
- [x] 프로젝트 구조 (frontend / backend / README / BUGS / TODO) 생성
- [x] Backend: Express 라우트·컨트롤러·서비스, SQLite 스키마, 고정 시드, Reset 구현
- [x] Frontend: 헤더/로고, 좌측 메뉴, 스토리, 피드, 상세 모달, 댓글, 작성 모달, 추천 사용자, 프로필, 저장, 알림, 활동 내역
- [x] 의도적 오류 5개 구현 및 `INTENTIONAL_ERROR` 주석 / `data-bug-id` 적용
- [x] README.md, BUGS.md 작성

## 정적 점검 (수행함)
- [x] Backend 전체 JS 파일 `node --check` 구문 검사 통과 (19개 파일)
- [x] 오류 암시 변수명(`bugButton`, `brokenPost`, `errorItem`) 미사용 확인 (grep)
- [x] 코드 리뷰로 오류 5개의 위치·동작 경로 확인
- [ ] Frontend JSX 구문/빌드 검사 (빌드 금지로 미수행)

## 기능 점검 (브라우저 실행 필요 — 미수행)
- [ ] 검색 / 정렬 / 필터 / 더보기
- [ ] 게시물 작성·수정·삭제
- [ ] 댓글 작성·삭제, 좋아요, 저장 취소
- [ ] 팔로우/언팔로우, 프로필, 팔로잉 목록
- [ ] 알림 읽음 처리, 활동 내역, 데이터 초기화 버튼

## API 검증 (서버 실행 필요 — 미수행)
- [ ] `npm install` 후 Backend 기동 및 시드 건수 확인 (`POST /api/test/reset` 응답 `counts`)
- [ ] 모든 엔드포인트 응답 확인
- [ ] 동일 Reset 절차 후 데이터 동일성 확인

## 오류 재현 (브라우저 실행 필요 — 미수행)
- [ ] B01-ERR01 피드 중복
- [ ] B01-ERR02 로고 클릭 무반응
- [ ] B01-ERR03 저장 토스트 누락
- [ ] B01-ERR04 댓글 POST 2회
- [ ] B01-ERR05 팔로잉 수 캐시 불일치

## 미완료 / 참고
- 위 미수행 항목은 실제 실행 후 확인 필요.
- `better-sqlite3` 버전(^12.2.0)은 설치 환경의 Node 버전과 호환되는지 `npm install` 시 확인 필요.
