# BlueSky Travel - 여행 예약 플랫폼

## 사이트 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | BlueSky Travel |
| **사이트 ID** | site002 |
| **포트** | 9221 |
| **기술 스택** | React 18 + Vite 5 + Express 4 + Lucide React |
| **주제** | 여행 예약 플랫폼 (항공/호텔) |

## 실행 방법

```bash
cd site002
npm install
npm run build   # React 앱 빌드
npm start       # Express 서버 실행 (포트 9221)
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/cities` | 인기 도시 목록 조회 |
| GET | `/api/hotels?cityId=1&minRating=4.5` | 호텔 목록 조회 (필터링 지원) |

## 정상 작동 기능

- ✅ 도시 카드 클릭 시 해당 도시 호텔로 필터링
- ✅ 드롭다운으로 숙소 등급(성급) 필터링
- ✅ 인원 수 변경
- ✅ 호텔의 "예약하기" 버튼 클릭 시 예약 요약 사이드 패널 열기

## 의도된 GUI 오류 3개

### site002-bug01 — button-no-response
- **위치**: Hero 검색 영역 "다음 단계" 버튼
- **증상**: 버튼 클릭해도 예약 단계로 이동하지 않음
- **selector**: `[data-bug-id="site002-bug01"]`

### site002-bug02 — component-rendering
- **위치**: 숙소 목록 중 일부 호텔 카드 하단 가격
- **증상**: 정상적인 가격 대신 `undefined` 문자열이 렌더링됨
- **selector**: `[data-bug-id="site002-bug02"]`

### site002-bug03 — css-layout
- **위치**: 상단 헤더
- **증상**: Sticky 헤더가 네거티브 마진으로 인해 아래 컨텐츠(Hero 최상단)를 일부 덮어 가림
- **selector**: `[data-bug-id="site002-bug03"]`

## PPO 에이전트 탐지 기대 행동

- `bug01`: 버튼 클릭 후 아무런 UI 변화 없음 탐지
- `bug02`: 렌더링된 요소의 텍스트가 `undefined`로 노출됨 탐지
- `bug03`: 특정 요소의 영역(bounding box)이 의도치 않게 다른 주요 컨텐츠 영역을 가리거나 겹침 탐지
