# BookHaven - 온라인 서점

## 사이트 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | BookHaven |
| **사이트 ID** | site001 |
| **포트** | 9220 |
| **기술 스택** | React 18 + Vite 5 + Express 4 |
| **주제** | 온라인 서점 |

## 실행 방법

```bash
cd site001
npm install
npm run build   # React 앱 빌드
npm start       # Express 서버 실행 (포트 9220)
```

개발 모드 (핫리로드):
```bash
npm run dev     # Express(9220) + Vite dev server(5174) 동시 실행
```

브라우저에서 → `http://localhost:9220`

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/genres` | 장르 목록 |
| GET | `/api/books/bestsellers` | 베스트셀러 도서 목록 |
| GET | `/api/books/recommended` | 추천 도서 목록 |
| GET | `/api/books/search?q=검색어&genre=장르` | 도서 검색 |
| GET | `/api/cart` | 장바구니 (mock) |

## 정상 작동 기능

- ✅ 상단 헤더 검색창으로 도서 제목/저자 필터링
- ✅ 장르 탭 클릭 시 해당 장르 도서만 표시
- ✅ 추천 도서 "담기" 버튼으로 장바구니 추가
- ✅ 상단 🛒 버튼 클릭으로 장바구니 패널 열기/닫기
- ✅ 장바구니에서 항목 삭제
- ✅ 장바구니 합계 금액 자동 계산
- ✅ 헤더 장바구니 아이콘 카운트 업데이트
- ✅ /api/health 헬스체크

## 의도된 GUI 오류 3개

### site001-bug01 — button-no-response
- **위치**: 베스트셀러 섹션 → 각 도서 카드 "구매하기" 버튼
- **증상**: 버튼 클릭해도 장바구니에 추가되지 않음
- **selector**: `[data-bug-id="site001-bug01"]`
- **파일**: `src/components/BestsellerSection.jsx`

### site001-bug02 — component-rendering
- **위치**: 추천 도서 섹션 → 목록 맨 마지막 카드
- **증상**: 첫 번째 추천 도서 카드가 목록 끝에 중복 렌더링됨
- **selector**: `[data-bug-id="site001-bug02"]`
- **파일**: `src/components/RecommendedSection.jsx`

### site001-bug03 — css-layout
- **위치**: 추천 도서 섹션 전체 (모바일 ≤768px)
- **증상**: 모바일에서 추천 도서 카드들이 서로 겹쳐 보임
- **selector**: `[data-bug-id="site001-bug03"]`
- **파일**: `src/styles/main.css`

## PPO 에이전트 탐지 기대 행동

| bugId | 에이전트 탐지 방법 |
|-------|------------------|
| bug01 | `[data-bug-id="site001-bug01"]` 클릭 → 장바구니 카운트 변화 없음 확인 |
| bug02 | 추천 섹션에서 동일 제목 카드 2개 이상 존재 → `id="rc-card-duplicate"` 탐지 |
| bug03 | 뷰포트 768px 이하에서 `.rc-card` 요소들의 bounding box 겹침 확인 |

## 관련 파일

- 📋 `BUGS.md` — 의도된 버그 상세 명세
- ✅ `TODO.md` — 진행 상태 체크리스트

## 배포 시 주의사항

- `npm run build` 후 `dist/` 폴더가 생성되어야 `npm start` 정상 동작
- `PORT` 환경변수로 포트 변경 가능 (기본: 9220)
- 의도된 GUI 버그는 프론트엔드에만 존재하며 서버는 항상 정상 응답
