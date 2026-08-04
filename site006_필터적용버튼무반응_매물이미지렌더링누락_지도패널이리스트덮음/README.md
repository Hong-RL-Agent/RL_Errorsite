# Prestige Homes - 프리미엄 부동산 플랫폼

## 사이트 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | Prestige Homes |
| **사이트 ID** | site006 |
| **포트** | 9225 |
| **기술 스택** | React 18 + Vite 5 + Express 4 + Lucide React |
| **주제** | 고급 부동산 매물 검색 플랫폼 (네이비/골드 테마) |

## 실행 방법

```bash
cd site006
npm install
npm run build   # React 앱 빌드
npm start       # Express 서버 실행 (포트 9225)
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/properties?type=전체&location=` | 매물 리스트 조회 (유형 및 지역명 필터) |

## 정상 작동 기능

- ✅ 레이아웃 상 헤더 및 필터, 매물 리스트, 지도 패널의 전반적인 컴포넌트 렌더링 확인
- ✅ 카드 호버 시 호버 이펙트 (박스 섀도우, 테두리 색상, 이동 애니메이션) 동작 확인
- ✅ 필터 내 Select Box, Text Input 값의 React State 반영 기능

## 의도된 GUI 오류 3개

### site006-bug01 — button-no-response
- **위치**: 좌측 필터 바의 "필터 적용" 버튼
- **증상**: 값 변경 후 버튼을 클릭해도 동작 및 필터링 처리가 일어나지 않음.
- **selector**: `[data-bug-id="site006-bug01"]`

### site006-bug02 — component-rendering
- **위치**: 본문 매물 리스트
- **증상**: `102번` 한남더힐, `105번` 연희동 프라이빗 빌라 매물의 이미지가 화면 상에 노출되지 않음.
- **selector**: `[data-bug-id="site006-bug02"]`

### site006-bug03 — css-layout
- **위치**: 우측 지도 패널
- **증상**: 우측에 위치해야 할 지도가 너비를 너무 넓게 잡아 중앙의 매물 리스트 카드를 위로 덮어서 가려버림.
- **selector**: `[data-bug-id="site006-bug03"]`
