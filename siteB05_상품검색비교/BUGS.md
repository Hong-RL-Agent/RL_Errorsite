# BUGS.md — B-05 CompareLab 의도적 오류 명세

공통 사항
- 모든 오류는 **Frontend에서만** 발생한다. Backend API는 정상 응답(검색 조건·페이지 메타데이터·hasMore·통계)을 반환한다.
- 화면에는 오류 ID/원인을 표시하지 않는다. `data-bug-id` 속성으로만 식별한다.
- 고정 seed(20260115) → Reset 후 상품 ID·정렬 순서가 동일하다.
- 사용 데이터 참고
  - 노트북 상품 ID 1~30, 모니터 31~60 … (카테고리당 30개, 12개 카테고리 총 360개)
  - 노트북 브랜드 ID 1(Novatek)·2(Aerion)·3(Lumio)·4(Kestrel)·5(Orbix) 각 6개
  - 이미지 수: ID%5==0 → 8장, ID%5==1 → 6장, 그 외 3장
- Frontend 검색 결과 페이지 크기는 8개.
- 증거 수집용: `window.__compareLabState`(filters / lastSearch / compare{itemIds, summary}), `window.__compareLabActions`(행동 로그), Network 탭(`/api/products`, `/api/comparisons/:id/statistics`), `/api/activity` 서버 로그.

---

## B05-ERR01 — 다단계 기억 부담

| 항목 | 내용 |
|---|---|
| bug_id | B05-ERR01 |
| CSV No | 2090 |
| CSV 오류명 | 다단계 기억 부담 |
| 확인전략 | SEQUENCE_REPLAY |
| DQN_학습대상 | 학습 대상 (Training) — 다단계 필터 조건 유지 여부 |
| 화면 위치 | 검색 화면(좌측 필터) → 비교 화면 → 검색 화면 |
| 관련 소스 파일 | `frontend/src/context/SearchContext.jsx` (`openCompare`), `frontend/src/components/FilterPanel.jsx`, `frontend/src/pages/ComparePage.jsx`, `frontend/src/App.jsx` |
| data-bug-id selector | `[data-bug-id="B05-ERR01"]` (필터 패널 `<aside>`, 비교 화면의 "검색 조건으로 돌아가기" 버튼) |
| precondition | Reset 직후, 검색 화면(`#/`) 진입. 비교 목록 비어 있음 |
| trigger sequence | 노트북 카테고리 → 가격 범위 설정 → 브랜드 2개 → RAM·저장공간 선택 → 상품 2개 체크 → 하단 "상품 비교" → 비교 화면에서 "검색 조건으로 돌아가기" |
| 정상 기대 동작 | 복귀 후에도 카테고리·가격·브랜드·스펙 조건이 그대로 유지 |
| 실제 오류 동작 | 복귀한 검색 화면에서 카테고리(노트북)·정렬만 남고 가격 슬라이더가 전체 범위, 브랜드/RAM/저장공간 체크가 모두 해제됨 |
| 코드상 의도된 원인 | `openCompare()`가 비교 화면 이동 시 `brands/minPrice/maxPrice/specs` 를 초기화(주석 `INTENTIONAL_ERROR: B05-ERR01`) |
| 필요한 Evidence | ActionLog + State + UI + DOM |
| Confirmation Oracle | 이동 전 필터(`__compareLabState.lastSearch`)와 복귀 후 필터(`__compareLabState.filters`)를 비교 → 가격/브랜드/스펙 유실 확인 |

재현 단계
1. 시작 화면: `http://localhost:5320` (Reset 직후 전체 상품 검색 화면).
2. 첫 행동: 상단 카테고리 메뉴에서 **노트북** 클릭 → URL 해시 `#/`, 필터 패널에 노트북 브랜드 5개·스펙 그룹 표시.
3. 두 번째 행동: 가격 슬라이더를 예) 80만~180만원으로 조정 → 브랜드 **Novatek, Aerion** 체크 → RAM **32GB**, 저장 공간 **256GB** 체크. (중간 상태: 상단 결과 건수가 줄고 `__compareLabState.filters` 에 brands=[1,2], minPrice/maxPrice, specs={ram,storage})
4. 다음 행동: 결과 카드 2개의 "비교 담기" 체크 → 하단 비교 바 "비교 상품 2/4" 표시.
5. 하단 **상품 비교** 클릭 → 비교 화면. (중간 상태: "이전 검색 조건" 영역에 가격/브랜드/스펙 칩이 정상 표시, 비교 테이블 2개 정상)
6. **검색 조건으로 돌아가기** 클릭.
7. 최종 상태: 검색 화면에서 카테고리는 유지되나 가격·브랜드·스펙 필터가 모두 초기화됨.

중간 상태 확인 방법: 비교 화면의 "이전 검색 조건" 칩(= `lastSearch`)을 5단계에서 기록해 두고 7단계 필터 UI와 비교.
Reset 이후 재현 여부: 재현됨 (`POST /api/test/reset` 후 동일 순서로 항상 발생). 첫 검색 시 필터 선택은 정상.
재현 완료 기준: 복귀 후 `filters.brands=[]`, `minPrice=maxPrice=null`, `specs={}` 이면서 `category='laptop'`.
DQN 기대 행동: 필터 3종 이상 적용 → 상품 2개 선택 → 비교 이동 → 복귀 후 필터 상태 diff 를 관찰하고 유실을 확정.

---

## B05-ERR02 — 페이지네이션 메타데이터 누락

| 항목 | 내용 |
|---|---|
| bug_id | B05-ERR02 |
| CSV No | 2111 |
| CSV 오류명 | 메타데이터 누락 |
| 확인전략 | SEQUENCE_REPLAY |
| DQN_학습대상 | 학습 대상 (Training) — 필터+정렬 조합 후 페이지 이동 |
| 화면 위치 | 검색 화면 하단 페이지네이션 |
| 관련 소스 파일 | `frontend/src/api/normalize.js`, `frontend/src/components/Pagination.jsx`, `frontend/src/pages/SearchPage.jsx` |
| data-bug-id selector | `[data-bug-id="B05-ERR02"]` (검색 결과 하단 `nav.pagination`) |
| precondition | 노트북 카테고리, 브랜드 Novatek·Aerion·Lumio(18개 상품 = 3페이지) |
| trigger sequence | 카테고리 선택 → 브랜드 3개 → 가격 낮은순 정렬 → 1페이지 확인 → 다음 페이지 클릭 |
| 정상 기대 동작 | 서버 meta(`total=18,totalPages=3,nextPage=2`)대로 2페이지로 이동 |
| 실제 오류 동작 | 1페이지 카드는 정상. 페이지 번호가 `1` 하나만 표시되고 "다음 페이지"가 비활성화되어 이동 불가 |
| 코드상 의도된 원인 | `normalizeProductList()` 가 category+brands+가격 정렬 조합에서 `nextPage`/`totalPages` 를 결과 객체에 복사하지 않음 |
| 필요한 Evidence | ActionLog + Network + UI + State + DOM |
| Confirmation Oracle | `/api/products?...sort=price_asc...` 응답 `meta.nextPage=2, totalPages=3` 인데 UI 의 다음 버튼 `disabled` |

재현 단계
1. 시작: 검색 화면. 2. **노트북** 선택. 3. 브랜드 Novatek, Aerion, Lumio 체크. (중간: 결과 18건, 정렬 인기순일 때는 페이지 번호 1·2·3 정상 표시 — 일반 페이지네이션 정상 확인 가능)
4. **가격 낮은순** 정렬 클릭. 5. 1페이지(8개) 확인 — 가격 오름차순 정상. 6. **다음 페이지** 클릭 → 이동하지 않음.
정상 대조: 같은 조건에서 인기순/평점순이거나 브랜드를 해제하면 정상 이동.
Reset 이후 재현 여부: 재현됨. 재현 완료 기준: 네트워크 응답에 nextPage 존재 + UI 다음 버튼 disabled + 페이지 번호 목록 1개.
DQN 기대 행동: 응답 JSON 과 UI 상태가 불일치함을 확인.

---

## B05-ERR03 — 이미지 갤러리의 페이지 정보 부재

| 항목 | 내용 |
|---|---|
| bug_id | B05-ERR03 |
| CSV No | 1679 |
| CSV 오류명 | 페이지네이션 없는 슬라이드 |
| 확인전략 | SEQUENCE_REPLAY |
| DQN_학습대상 | 학습 대상 (Training) |
| 화면 위치 | 상품 상세 페이지 이미지 갤러리 |
| 관련 소스 파일 | `frontend/src/components/ImageGallery.jsx`, `frontend/src/pages/ProductDetailPage.jsx` |
| data-bug-id selector | `[data-bug-id="B05-ERR03"]` (갤러리 루트 `.gallery`) |
| precondition | 이미지 8장 상품(ID%5==0, 예: 상품 5 `Orbix Edge 노트북 248`). 대조군: 6장 상품(상품 6 `Novatek Flex 노트북 285`) |
| trigger sequence | 검색 → 상품 5 상세 열기 → 갤러리 표시 → "다음 이미지" 여러 번 클릭 |
| 정상 기대 동작 | "3 / 8" 같은 현재/전체 표시와 썸네일 위치 표시 |
| 실제 오류 동작 | 이미지는 정상 전환되지만 번호·전체 개수·썸네일 인디케이터가 전혀 없음 |
| 코드상 의도된 원인 | 이미지 8장 이상 갤러리는 `dense` 레이아웃으로 카운터/썸네일을 렌더링하지 않음 |
| 필요한 Evidence | ActionLog + UI + DOM + State |
| Confirmation Oracle | 다음 버튼 N회 클릭 후 `img src` 는 변하는데 `.gallery-count` / `.gallery-thumbs` 가 DOM 에 없음 (대조: 상품 6에서는 존재) |

재현 단계
1. 시작: 검색 화면 → 검색창에 `Orbix Edge` 입력 후 검색. 2. 상품 5 카드 클릭 → 상세. 3. 갤러리 첫 이미지(정면) 표시 확인. 4. ›를 5회 클릭 → 이미지 라벨(정면→측면→…)이 바뀌지만 위치 표시 없음.
대조: 상품 6 상세에서는 `n / 6` 과 썸네일 스트립 표시.
Reset 이후 재현 여부: 재현됨(데이터 고정). 재현 완료 기준: 8장 갤러리에서 3회 이상 이동 후 `.gallery-count` 부재.
DQN 기대 행동: 이미지 전환 이벤트 후 UI 위치 정보 존재 여부를 관찰.

---

## B05-ERR04 — 종료 지점 없는 무한 스크롤

| 항목 | 내용 |
|---|---|
| bug_id | B05-ERR04 |
| CSV No | 1933 |
| CSV 오류명 | 무한 스크롤 중독 설계 |
| 확인전략 | SEQUENCE_REPLAY |
| DQN_학습대상 | 학습 대상 (Training) |
| 화면 위치 | 연속 탐색(`#/browse`) 하단 |
| 관련 소스 파일 | `frontend/src/pages/BrowsePage.jsx` |
| data-bug-id selector | `[data-bug-id="B05-ERR04"]` (하단 `.feed-more` / `.feed-end`) |
| precondition | 모니터 카테고리 + "60만원 이하" 가격 칩 → 서버 총 17개(8+8+1, 3회 요청) |
| trigger sequence | 연속 탐색 열기 → 카테고리 모니터 → 가격 칩 "60만원 이하" → 끝까지 스크롤 반복 |
| 정상 기대 동작 | 마지막 상품 로딩 후 "모든 상품을 확인했습니다" 표시 |
| 실제 오류 동작 | 서버 `hasMore=false` 임에도 "더 많은 상품을 확인하세요" 영역(점 애니메이션)이 유지되고 종료 안내 없음. 추가 요청은 발생하지 않음(최대 12회 제한) |
| 코드상 의도된 원인 | 가격 필터(`maxPrice !== null`) 적용 시 종료 분기 대신 탐색 유도 분기를 렌더링 |
| 필요한 Evidence | ActionLog + State + UI + DOM + Network |
| Confirmation Oracle | 마지막 응답 `meta.hasMore=false`, 카드 17개인데 `.feed-end` 없음/`.feed-more` 존재 |

재현 단계
1. 상단 "연속 탐색" 클릭(기본 모니터). 2. 가격 칩 "60만원 이하" 클릭 → 목록 8개 로딩. 3. 하단까지 스크롤 → 16개, 다시 스크롤 → 17개 (3번째 요청이 마지막). 4. 추가 스크롤을 반복해도 요청 없음, 하단 문구는 계속 "더 많은 상품을 확인하세요".
대조: 가격 칩 "가격 전체"에서는 30개(4번째 요청) 후 "모든 상품을 확인했습니다" 표시.
Reset 이후 재현 여부: 재현됨. 재현 완료 기준: `hasMore=false` 이후 종료 안내 부재.
DQN 기대 행동: 마지막 응답과 하단 UI 상태 불일치를 확인.

---

## B05-ERR05 — 상품 비교 요약 캐시 불일치

| 항목 | 내용 |
|---|---|
| bug_id | B05-ERR05 |
| CSV No | 1972 |
| CSV 오류명 | 캐시 상태 불일치 |
| 확인전략 | ACTION_REPLAY (복합 검색·비교 흐름 안에서 재현) |
| DQN_학습대상 | 학습 대상 (Training) |
| 화면 위치 | 비교 화면 상단 요약 패널 |
| 관련 소스 파일 | `frontend/src/context/CompareContext.jsx` (`removeProduct`), `frontend/src/pages/ComparePage.jsx` |
| data-bug-id selector | `[data-bug-id="B05-ERR05"]` (요약 패널 `section.summary-panel`) |
| precondition | 같은 카테고리 상품 3개를 비교 목록에 담음(예: 노트북 상품 1·2·3) |
| trigger sequence | 상품 3개 선택 → 상품 비교 → 테이블에서 하나 "제거" → 남은 2개 확인 |
| 정상 기대 동작 | 요약의 상품 개수·평균 가격이 2개 기준으로 갱신 |
| 실제 오류 동작 | 테이블은 2개, 요약 패널은 "3개 / 이전 평균 가격" 유지. 새로고침(F5) 하면 정상(2개) |
| 코드상 의도된 원인 | `removeProduct()` 가 제거 후 `refreshSummary()` 를 호출하지 않아 `summary` 캐시가 stale (추가/불러오기는 갱신) |
| 필요한 Evidence | ActionLog + UI + Network + State |
| Confirmation Oracle | 테이블 `data-product-id` 집합(2개) vs `summary.count`(3) / `summary.productIds`; Network 에 제거 후 `/statistics` 요청 없음 |

재현 단계
1. 검색 화면에서 같은 카테고리 상품 3개 "비교 담기"(중간: 하단 바 3/4, 통계 요청 3회 발생). 2. 상품 비교 클릭. 3. 요약 패널 "비교 상품 3개" 확인. 4. 테이블에서 한 상품 **제거**. 5. 테이블 열은 2개, 요약은 3개/기존 평균가 그대로.
ERR01 과 독립: 필터를 건드리지 않아도 재현. Reset 이후 재현 여부: 재현됨.
DQN 기대 행동: 제거 액션 후 테이블과 요약의 불일치를 확인하고, 새로고침 후 해소됨을 확인.
