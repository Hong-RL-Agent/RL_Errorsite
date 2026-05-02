# TODO.md — site079 StudyFlash

## 프로젝트 설정

- [x] site079 폴더 생성
- [x] package.json 작성 (start, dev, build 스크립트 포함)
- [x] Express 서버 구성 (port 9408)
- [x] public/ 디렉터리 구조 생성
- [x] npm install 후 npm start 실행 가능

## API 엔드포인트

- [x] GET /api/health
- [x] GET /api/decks (tag, q 필터)
- [x] GET /api/decks/:id
- [x] GET /api/cards/:deckId
- [x] GET /api/cards/:deckId/:cardIndex
- [x] GET /api/progress/:deckId
- [x] POST /api/progress
- [x] GET /api/wrong-notes
- [x] POST /api/wrong-notes
- [x] DELETE /api/wrong-notes/:id
- [x] GET /api/tags

## 의도된 오류 구현

- [x] bug01 — DB 진행률 저장 오류 (database-persistence) — POST 성공 응답만 반환, 실제 저장 없음
- [x] bug02 — 네트워크 응답 순서 오류 (network-race-condition) — 0~800ms 랜덤 지연
- [x] bug03 — 비공개 덱 접근 제어 실패 (security-access-control) — isPrivate/owner 검증 없음
- [x] 각 오류 코드 바로 위에 INTENTIONAL BUG 주석 작성
- [x] 각 오류 위치에 data-bug-id 속성 부착

## 프론트엔드 구현

- [x] 섹션 1: 덱 목록 (검색, 태그 필터, 그리드)
- [x] 섹션 2: 학습 모드 (덱 선택, 플래시카드, 정답/오답)
- [x] 섹션 3: 오답 노트 (목록, 삭제)
- [x] 섹션 4: 진행률 (덱별 바 차트, 통계)
- [x] 섹션 5: 프로필 (사용자 정보, 설정 토글)

## 인터랙션 구현 (14개)

- [x] 덱 검색 (실시간)
- [x] 태그 필터 (칩 선택)
- [x] 덱 상세 모달 (카드/정보 탭 전환)
- [x] 학습 덱 선택
- [x] 카드 뒤집기 (앞면 → 뒷면)
- [x] 정답/오답 체크 (세션 점수 기록)
- [x] 오답 노트 자동 추가
- [x] 오답 노트 삭제
- [x] 진행률 조회 (시각화)
- [x] 사이드바 뷰 전환 (5개)
- [x] 학습 완료 화면 + 다시 학습
- [x] 프로필 설정 토글
- [x] 새로고침 버튼
- [x] 모달 열기/닫기 (✕, ESC, 오버레이)

## 문서화

- [x] README.md 작성
- [x] BUGS.md 작성
- [x] TODO.md 작성

## 미완료 / 향후 개선 사항

- [ ] 실제 사용자 인증 (JWT/세션)
- [ ] 비공개 덱 접근 제어 수정 (bug03 픽스)
- [ ] 진행률 실제 저장 구현 (bug01 픽스)
- [ ] AbortController로 race condition 방지 (bug02 픽스)
- [ ] 덱 생성/편집 기능
- [ ] 카드 직접 편집 기능
- [ ] 스페이스드 리피티션 알고리즘 적용
- [ ] 통계 차트 (Chart.js 연동)
