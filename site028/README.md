# PremiRide — 프리미엄 자동차 렌트 서비스

## 기본 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | PremiRide |
| **사이트 ID** | site028 |
| **포트** | 9247 |
| **기술 스택** | React 18, Vite 5, Express 4, Node.js |
| **테마** | 자동차 렌트 / 차량 예약 서비스 |
| **디자인** | 화이트 / 미드나잇블루 / 실버 / 옐로우 포인트 |

---

## 실행 방법

```bash
cd site028
npm install
npm run build
npm start
# → http://localhost:9247
```

개발 모드 (핫리로드):
```bash
npm run dev
# Vite: http://localhost:5173 (API → 9247 proxy)
# Express: http://localhost:9247
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/cars` | 전체 차량 목록 (총 12대) |
| GET | `/api/cars?type=SUV` | 차량 유형 필터 |
| GET | `/api/cars?fuel=전기` | 연료 유형 필터 |
| GET | `/api/insurance-options` | 보험 옵션 3종 |

### `/api/cars` 응답 예시
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "model": "Hyundai Sonata",
      "brand": "Hyundai",
      "type": "중형",
      "fuel": "가솔린",
      "seats": 5,
      "dailyRate": 45000,
      "branch": "강남점",
      "available": true,
      "rating": 4.5,
      "reviews": 128,
      "features": ["블루투스", "후방카메라", "크루즈컨트롤"]
    }
  ],
  "total": 12
}
```

### `/api/insurance-options` 응답 예시
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "기본 보장", "price": 0, "recommended": false },
    { "id": 2, "name": "일반 보장", "price": 10000, "recommended": false },
    { "id": 3, "name": "프리미엄 보장", "price": 20000, "recommended": true }
  ]
}
```

---

## 정상 동작 기능 목록

1. 헤더 로고 및 네비게이션 링크 표시
2. 모바일 햄버거 메뉴 토글
3. Hero 섹션 "주말 특가 렌트" CTA 버튼 작동
4. 픽업 위치 텍스트 입력 및 상태 반영
5. 픽업/반납 날짜 선택 및 상태 반영
6. 차량 유형 필터 (전체/소형/중형/대형/SUV/럭셔리) 정상 동작
7. 연료 유형 필터 (전체/가솔린/디젤/전기/하이브리드) 정상 동작
8. 차량 카드 그리드 렌더링 (API fetch)
9. 차량 카드 클릭 → 상세 모달 열기
10. 모달 ESC 키 / 배경 클릭 / ✕ 버튼으로 닫기
11. 보험 옵션 카드 클릭 → 선택 하이라이트 표시
12. 차량 카드 "예약하기" 버튼 → 예약 요약 패널 업데이트
13. 예약 요약 대여 기간 자동 계산
14. 추천 차량 캐러셀 이전/다음 네비게이션
15. 캐러셀 도트 인디케이터 클릭 이동
16. API 로딩 스피너 표시
17. API 오류 상태 및 "다시 시도" 버튼
18. 예약 불가 차량 비활성화 표시
19. 푸터 섹션 링크 그룹 (보험/렌트조건/지점/고객센터)
20. 반응형 레이아웃 (모바일 ≤ 599px, 태블릿 600~899px, 데스크톱)

---

## 의도된 프론트엔드 오류 3개

### BUG 01 — 옵션 요약 상태 불일치
- **data-bug-id**: `site028-bug01`
- **type**: `selected-option-summary-mismatch`
- **위치**: 예약 요약 패널 > 보험 블록
- **증상**: 보험 옵션 카드에서 "프리미엄 보장"을 선택해도 예약 요약 패널의 보험 표시는 항상 "기본 보장"으로 고정됨
- **원인**: `App.jsx`에서 `selectedInsurance`(UI용)와 `insuranceSummary`(요약용)가 분리된 state로 관리되며, `insuranceSummary`는 절대 업데이트되지 않음

### BUG 02 — 가격 카드 겹침
- **data-bug-id**: `site028-bug02`
- **type**: `price-card-overlap`
- **위치**: 메인 레이아웃 전체 (900px ~ 1100px 뷰포트)
- **증상**: 태블릿 폭(900~1100px)에서 예약 요약 패널이 차량 카드 그리드 위로 겹쳐 보임
- **원인**: `responsive.css`의 해당 미디어 쿼리에서 `.booking-summary-panel`에 `position: absolute; z-index: 30` 적용으로 레이아웃 이탈

### BUG 03 — 버튼 클릭 무반응
- **data-bug-id**: `site028-bug03`
- **type**: `reserve-button-no-response`
- **위치**: 추천 차량 캐러셀 > 첫 번째 카드 (Kia Sorento)
- **증상**: 첫 번째 추천 차량의 "예약하기" 버튼이 정상처럼 보이지만 클릭해도 예약 요약 패널에 반영되지 않음
- **원인**: `RecommendationCarousel.jsx`에서 `index === 0` 카드의 `onClick`이 `() => {}`로 연결되어 `onReserve(car)` 호출 누락

---

## 관련 문서

- **[BUGS.md](./BUGS.md)** — 의도된 오류 3개 상세 기록 (화면 위치, 관련 파일, 증상, 원인, 탐지 포인트)
- **[TODO.md](./TODO.md)** — 생성/검증/배포 체크리스트

---

## PPO 에이전트 탐지 기대 행동

| Bug ID | 탐지 방법 |
|--------|----------|
| site028-bug01 | 보험 옵션 클릭 후 `[data-bug-id="site028-bug01"]` 텍스트 변화 없음 확인 |
| site028-bug02 | 900~1100px 뷰포트에서 `[data-bug-id="site028-bug02"]` 위치가 차량 카드와 겹침 확인 |
| site028-bug03 | `[data-bug-id="site028-bug03"]` 클릭 후 예약 요약 상태 미변경 확인 |

---

## 배포 시 주의 사항

- `npm run build` 후 `dist/` 폴더가 생성되어야 `npm start`가 정상 작동합니다.
- 포트 9247이 사용 중이면 `server.js`의 `PORT` 값을 변경하세요.
- Google Fonts는 인터넷 연결이 필요합니다. 오프라인 환경에서는 시스템 폰트로 대체됩니다.
- 의도된 오류는 프론트엔드에만 존재하며 서버/API는 항상 정상 동작합니다.
