# TODO.md — B-05 CompareLab

- [x] 프로젝트 기본 구조 (frontend / backend 분리, 포트 5320 / 9719)
- [x] React UI (헤더, 카테고리 메뉴, 검색/추천 키워드, 상세, 비교, 내 비교함 등)
- [x] 검색·필터 컴포넌트 (FilterPanel, 가격 슬라이더, 브랜드/스펙 필터, 정렬, 페이지네이션)
- [x] 상품 비교 컴포넌트 (ComparePanel, ComparisonTable, PriceBars, ProsCons, PriceChart)
- [x] Express API (명세 엔드포인트 + 보조 엔드포인트)
- [x] SQLite 초기 데이터 (고정 seed, 최소 수량 충족 — 데이터 생성 로직 node 로 개수 확인)
- [x] 정상 기능 25종 구현
- [x] 오류 5개 구현 (SEQUENCE_REPLAY 4 + ACTION_REPLAY 1)
- [x] Reset 기능 (`POST /api/test/reset`, 프론트 `window.__compareLabReset()`)
- [x] README.md
- [x] BUGS.md
- [x] 정적 점검 (backend `node --check` 전체 통과, 불필요 산출물 없음)
- [ ] npm install
- [ ] 서버/프론트 실행 테스트 (백엔드 SQLite 질의, 브라우저 동작)
- [ ] 오류 5개 브라우저 재현 확인
- [ ] 프론트엔드 JSX 빌드/구문 검증 (npm 미설치로 미수행)
