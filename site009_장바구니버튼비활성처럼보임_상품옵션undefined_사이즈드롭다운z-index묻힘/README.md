# BLANC & NOIR - 패션 커머스 사이트

## 사이트 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | BLANC & NOIR |
| **사이트 ID** | site009 |
| **포트** | 9228 |
| **기술 스택** | React 18 + Vite 5 + Express 4 + Lucide React |
| **주제** | 미니멀 흑백 테마 패션 쇼핑몰 |

## 실행 방법

```bash
cd site009
npm install
npm run build   # React 앱 빌드
npm start       # Express 서버 실행 (포트 9228)
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/categories` | 상품 분류 카테고리 (ALL, NEW, OUTER, 등) |
| GET | `/api/products?category=ALL` | 분류별 상품 목록 조회 |

## 정상 작동 기능

- ✅ 메인 카테고리 탭 클릭을 통한 상품 필터링 (ALL, OUTER 등)
- ✅ 상품별 색상 스와치(Swatch) 클릭 시 테두리 하이라이트 동작
- ✅ 우측 상단 장바구니 아이콘 클릭 시 Mini Cart 사이드 패널 열기/닫기 슬라이드 애니메이션
- ✅ 장바구니 추가 시 헤더 아이콘 뱃지 숫자 갱신 및 내역 추가 동작

## 의도된 GUI 오류 3개

### site009-bug01 — form-ui
- **위치**: 상품 목록 카드 하단의 "ADD TO CART" 버튼
- **증상**: 필수 옵션을 선택해도 버튼이 여전히 회색 배경에 비활성화된 것처럼 보임(사용성 저하 유발).
- **selector**: `[data-bug-id="site009-bug01"]`

### site009-bug02 — component-rendering
- **위치**: 상품 카드 색상 스와치 바로 아래 텍스트
- **증상**: 제공되지 않는 속성값에 접근하여 "Material: undefined" 문자열이 그대로 노출됨.
- **selector**: `[data-bug-id="site009-bug02"]`

### site009-bug03 — dropdown-layout
- **위치**: 상품 카드의 "SIZE" 선택 드롭다운 박스
- **증상**: 드롭다운 오픈 시 아래에 위치한 다른 상품 카드 배경 밑으로 들어가 가려짐 (z-index 결함).
- **selector**: `[data-bug-id="site009-bug03"]`
