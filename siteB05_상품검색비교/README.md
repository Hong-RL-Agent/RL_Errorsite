# CompareLab (B-05) — 상품 검색·비교 사이트

- 사이트 ID: **B-05** / 이름: **CompareLab**
- 학습 용도: **Training** / 주요 확인전략: **SEQUENCE_REPLAY** (ERR05 만 ACTION_REPLAY)
- 전자제품·생활가전·디지털기기 가상 데이터 기반 검색·스펙 비교 서비스 (외부 쇼핑몰/결제/배송 API 없음)

## 기술 스택
- Frontend: React 18 + Vite (포트 **5320**)
- Backend: Node.js + Express (포트 **9719**)
- DB: SQLite (`better-sqlite3`, 파일 `backend/data/comparelab.db`, 서버 최초 기동 시 자동 생성·시드)

## 폴더 구조
```
siteB05_상품검색비교/
├─ frontend/  (src: components, pages, hooks, context, api, styles)
├─ backend/   (server.js, routes, controllers, services, db/{init,seed}.js, data/)
├─ README.md  BUGS.md  TODO.md
```

## 설치 및 실행 (각각 다른 터미널)
```
cd backend  && npm install && npm run dev     # http://localhost:9719
cd frontend && npm install && npm run dev     # http://localhost:5320
```
브라우저: http://localhost:5320

## 화면 구성
헤더/통합 검색/인기·추천 키워드/카테고리 메뉴, 좌측 필터(가격 슬라이더·브랜드·스펙), 정렬, 상품 그리드, 상품 상세(이미지 갤러리·스펙 표·판매처·가격 추이 SVG·장단점·리뷰), 하단 비교 바, 비교 화면(비교 테이블·요약 카드·가격 그래프·장단점·저장), 연속 탐색(무한 스크롤), 내 비교함(저장 비교·최근 본 상품·검색 기록·활동 로그).

## API
```
GET  /api/health
GET  /api/categories            GET /api/brands            GET /api/filters
GET  /api/products              GET /api/products/:id
GET  /api/products/:id/images | specifications | reviews | price-history
GET  /api/search/suggestions    GET /api/search/history    (+POST: 검색 기록 저장)
GET/POST /api/comparisons       GET/PATCH/DELETE /api/comparisons/:id
POST /api/comparisons/:id/products     DELETE /api/comparisons/:id/products/:productId
GET  /api/comparisons/:id/statistics
GET/POST /api/recently-viewed   GET/POST /api/activity
GET  /api/images/:id.svg        (상품 이미지 SVG)
POST /api/test/reset
```
`GET /api/products` 파라미터: `query, category(slug), brand(id,id), minPrice, maxPrice, sort(popular|rating|price_asc|price_desc), page, limit, spec_<key>=값1,값2`.
응답: `{ data: [...], meta: { total, page, limit, totalPages, hasNext, hasMore, nextPage, prevPage } }`.

## 정상 기능 (실제 API 연동)
상품명 검색, 카테고리, 브랜드, 가격 범위, 스펙 필터, 복합 필터, 필터 초기화, 정렬 4종(서버), 상품 상세, 이미지 갤러리, 비교 담기/제거(최대 4개, 같은 카테고리, 중복 방지), 스펙 비교, 비교 저장/불러오기/삭제, 가격 변화, 최근 본 상품, 리뷰(페이지), 목록 페이지 이동, 검색 기록, 활동 로그, 데이터 초기화.

## 초기 데이터 (고정 seed 20260115)
상품 360 / 카테고리 12 / 브랜드 45 / 스펙 1770 / 판매처 가격 1080 / 가격 이력 2880 / 이미지 1656 / 리뷰 450 / 사용자 100 / 저장 비교 120 / 검색 기록 200 / 조회 기록 180 / 활동 로그 120.
현재 체험 사용자(ID 1)의 비교·기록은 Reset 직후 비어 있다.

## 의도적 오류 5개 (상세는 BUGS.md)
| ID | 전략 | 요약 | 핵심 복합 시나리오 |
|---|---|---|---|
| B05-ERR01 | SEQUENCE_REPLAY | 비교 화면 왕복 시 필터 유실 | 노트북→가격→브랜드 2→RAM·저장공간→상품 2개→상품 비교→검색 조건으로 돌아가기 |
| B05-ERR02 | SEQUENCE_REPLAY | 복합 필터+가격 정렬에서 페이지 메타 누락 | 노트북→브랜드 3개→가격 낮은순→다음 페이지 |
| B05-ERR03 | SEQUENCE_REPLAY | 8장 갤러리 인디케이터 없음 | 상품 5 상세→다음 이미지 반복 |
| B05-ERR04 | SEQUENCE_REPLAY | 종료 안내 없는 무한 스크롤 | 연속 탐색→모니터→60만원 이하→스크롤 반복 |
| B05-ERR05 | ACTION_REPLAY | 제거 후 비교 요약 캐시 불일치 | 3개 선택→비교→1개 제거 |

## Reset API
`POST http://localhost:9719/api/test/reset` — DB 를 비우고 고정 seed 로 재생성(상품·스펙·가격·정렬 복원, 비교·검색·최근 본 상품·활동 로그 초기화).
프론트 상태(검색 필터, 비교 캐시, sessionStorage)는 푸터의 "데이터 초기화" 버튼 또는 브라우저 콘솔 `await window.__compareLabReset()` 로 함께 초기화되고 최초 검색 화면(`#/`)으로 복귀한다.

## DQN Evidence 확인 방법
- State: `window.__compareLabState` (`filters`, `lastSearch`, `compare.itemIds`, `compare.summary`)
- ActionLog: `window.__compareLabActions` 및 `GET /api/activity` (open_compare, return_to_search, compare_add/remove 등)
- Network: `/api/products`(meta), `/api/comparisons/:id/statistics`
- DOM: `[data-bug-id]` 속성, `.gallery-count`, `.feed-end`, `.pagination button`, `[data-product-id]`
- 문서: BUGS.md(오류 상세), TODO.md(진행·미검증 항목)

## 점검 상태
정적 점검만 수행했다. npm install / 서버 실행 / 브라우저 재현은 수행하지 않았다 (TODO.md 참고).
