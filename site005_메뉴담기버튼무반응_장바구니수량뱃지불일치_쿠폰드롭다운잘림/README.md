# Yami Delivery - 배달앱

## 사이트 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | Yami Delivery |
| **사이트 ID** | site005 |
| **포트** | 9224 |
| **기술 스택** | React 18 + Vite 5 + Express 4 + Lucide React |
| **주제** | 모바일 배달앱 웹버전 (오렌지/레드 테마) |

## 실행 방법

```bash
cd site005
npm install
npm run build   # React 앱 빌드
npm start       # Express 서버 실행 (포트 9224)
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/categories` | 음식 카테고리 목록 조회 |
| GET | `/api/restaurants?category=전체` | 음식점 및 메뉴 목록 조회 (카테고리 필터) |

## 정상 작동 기능

- ✅ 메인 상단 배달 주소 클릭 시 prompt 모달을 통한 주소 변경 기능
- ✅ 횡스크롤 메뉴 카테고리를 통한 리스트 필터링 기능
- ✅ 대부분의 메뉴(버그 메뉴 제외) 담기 버튼 클릭 시 장바구니 상태 업데이트
- ✅ 하단바 '장바구니' 클릭 시 팝업(Drawer) 형태로 장바구니 모달 오픈 기능
- ✅ 장바구니 모달 내에서 삭제 버튼 및 총 결제 금액 실시간 계산

## 의도된 GUI 오류 3개

### site005-bug01 — button-no-response
- **위치**: 황금올리브 치킨 - "후라이드 치킨" 메뉴의 [담기] 버튼
- **증상**: 다른 버튼과 다르게 아무 기능도 수행하지 않음.
- **selector**: `[data-bug-id="site005-bug01"]`

### site005-bug02 — state-mismatch
- **위치**: 하단 네비게이션 탭의 [장바구니] 아이콘 우측 상단 뱃지
- **증상**: 담은 수량에 관계없이 하드코딩된 `9`로 고정되어 출력됨.
- **selector**: `[data-bug-id="site005-bug02"]`

### site005-bug03 — dropdown-layout
- **위치**: 메인 콘텐츠 상단의 쿠폰 드롭다운
- **증상**: 드롭다운 오픈 시 아래쪽으로 열리는 쿠폰 리스트 하단이 카드 영역 밖에서 렌더링되지 않고 잘려서 보이지 않음 (`overflow: hidden`).
- **selector**: `[data-bug-id="site005-bug03"]`
