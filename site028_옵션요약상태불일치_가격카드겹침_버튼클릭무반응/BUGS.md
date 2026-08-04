# BUGS.md — site028 PremiRide 자동차 렌트

의도된 프론트엔드 GUI 오류 3개에 대한 상세 기록입니다.

---

## BUG 01 — 옵션 요약 상태 불일치

| 항목 | 내용 |
|------|------|
| **bugId** | site028-bug01 |
| **CSV 오류명** | 옵션 요약 상태 불일치 |
| **type** | selected-option-summary-mismatch |
| **data-bug-id selector** | `[data-bug-id="site028-bug01"]` |

### 화면 위치
- 화면 중앙 보험 옵션 선택 카드 섹션 (InsuranceOptions)
- 우측 sticky 예약 요약 패널 내 "보험" 블록 (BookingSummary)

### 관련 파일
- `src/App.jsx` — `insuranceSummary` state 선언 및 `handleInsuranceSelect` 함수
- `src/components/BookingSummary.jsx` — `insuranceSummary` prop을 사용해 보험명 렌더링
- `src/components/InsuranceOptions.jsx` — `selectedInsurance` state를 사용해 선택 하이라이트

### 사용자가 경험하는 증상
1. 사용자가 보험 옵션 중 "프리미엄 보장" 또는 "일반 보장"을 클릭한다.
2. 보험 옵션 카드에는 "✓ 선택됨"으로 정상 하이라이트된다.
3. 그러나 우측 예약 요약 패널의 보험 항목에는 여전히 "기본 보장"이 표시된다.
4. 보험료 계산도 "기본 보장" 기준(0원)으로 유지된다.

### 코드상 의도된 원인
```javascript
// src/App.jsx

// 정상 동작: 보험 옵션 카드 UI 하이라이트용
const [selectedInsurance, setSelectedInsurance] = useState(null);

// INTENTIONAL GUI BUG: site028-bug01 — 초기값으로 고정, 절대 업데이트되지 않음
const [insuranceSummary] = useState({ id: 1, name: '기본 보장', price: 0 });

const handleInsuranceSelect = (option) => {
  setSelectedInsurance(option); // UI 하이라이트만 변경
  // insuranceSummary는 setInsuranceSummary가 존재하지 않아 절대 변하지 않음
};
```
`BookingSummary`는 `insuranceSummary` prop만 받아 렌더링하므로 항상 초기값인 "기본 보장"을 표시한다.

### PPO 에이전트 탐지 기대 행동
- `[data-bug-id="site028-bug01"]` 요소 텍스트 변화를 관찰한다.
- InsuranceOptions에서 "프리미엄 보장" 클릭 → 해당 카드에 "선택됨" 표시 확인
- 동시에 `data-bug-id="site028-bug01"` 내 텍스트가 "기본 보장"에서 변경되지 않는 것을 탐지
- 두 상태 간 불일치(inconsistency)를 오류로 분류

---

## BUG 02 — 가격 카드 겹침

| 항목 | 내용 |
|------|------|
| **bugId** | site028-bug02 |
| **CSV 오류명** | 가격 카드 겹침 |
| **type** | price-card-overlap |
| **data-bug-id selector** | `[data-bug-id="site028-bug02"]` |

### 화면 위치
- 메인 콘텐츠 레이아웃 전체 영역 (900px ~ 1100px 뷰포트 폭)
- 예약 요약 패널 (BookingSummary) 가 차량 카드 그리드 위로 겹침

### 관련 파일
- `src/styles/responsive.css` — `@media (min-width: 900px) and (max-width: 1100px)` 블록
- `src/components/BookingSummary.jsx` — `data-bug-id="site028-bug02"` 속성

### 사용자가 경험하는 증상
1. 브라우저 창 폭이 900px ~ 1100px (태블릿 가로, 소형 노트북)일 때 발생한다.
2. 예약 요약 패널이 `position: absolute`로 변환되어 차량 카드 그리드 위에 겹쳐 보인다.
3. 차량 카드 일부가 요약 패널 뒤로 가려져 클릭 불가능해진다.
4. 1100px 초과 또는 900px 미만에서는 정상 레이아웃으로 표시된다.

### 코드상 의도된 원인
```css
/* src/styles/responsive.css */
@media (min-width: 900px) and (max-width: 1100px) {
  .main-content {
    grid-template-columns: 1fr; /* 단일 컬럼으로 전환 */
  }
  .booking-summary-panel {
    position: absolute; /* 그리드 흐름에서 이탈 */
    top: 140px;
    right: 24px;
    width: 340px;
    z-index: 30; /* 차량 카드 위로 올라옴 */
  }
}
```
`.main-content`가 `position: relative`이므로 요약 패널이 절대 위치로 겹친다.

### PPO 에이전트 탐지 기대 행동
- 뷰포트를 900px ~ 1100px 범위로 조절한다.
- `[data-bug-id="site028-bug02"]` 요소의 `getBoundingClientRect()`를 차량 카드들의 위치와 비교한다.
- 오버랩 감지 (교차 영역 존재 여부) 를 오류로 분류

---

## BUG 03 — 버튼 클릭 무반응

| 항목 | 내용 |
|------|------|
| **bugId** | site028-bug03 |
| **CSV 오류명** | 버튼 클릭 무반응 |
| **type** | reserve-button-no-response |
| **data-bug-id selector** | `[data-bug-id="site028-bug03"]` |

### 화면 위치
- 본문 하단 "이 주의 추천 차량" 캐러셀 섹션 (RecommendationCarousel)
- 첫 번째 추천 차량 카드 (index === 0) 의 "예약하기" 버튼

### 관련 파일
- `src/components/RecommendationCarousel.jsx` — `index === 0` 조건 분기

### 사용자가 경험하는 증상
1. "이 주의 추천 차량" 섹션의 첫 번째 카드 (Kia Sorento) "예약하기" 버튼을 클릭한다.
2. 버튼 스타일은 정상이고 클릭 커서가 보이며 hover 효과도 작동한다.
3. 클릭해도 우측 예약 요약 패널에 차량이 반영되지 않는다.
4. 두 번째 이후 추천 차량의 "예약하기" 버튼은 정상적으로 예약 요약에 반영된다.

### 코드상 의도된 원인
```jsx
// src/components/RecommendationCarousel.jsx
{index === 0 ? (
  // INTENTIONAL GUI BUG: site028-bug03
  <button
    className="btn-rec-reserve"
    data-bug-id="site028-bug03"
    onClick={() => {}}  // 빈 핸들러 — onReserve(car) 가 호출되지 않음
  >
    예약하기
  </button>
) : (
  <button
    className="btn-rec-reserve"
    onClick={() => onReserve(car)}  // 정상 핸들러
  >
    예약하기
  </button>
)}
```

### PPO 에이전트 탐지 기대 행동
- `[data-bug-id="site028-bug03"]` 버튼을 클릭한다.
- 클릭 전/후 예약 요약 패널의 "선택 차량" 영역 상태 변화를 관찰한다.
- 상태 변화 없음 → 정상 버튼과 동작 불일치 → 오류로 분류
- 인접한 다른 추천 차량 버튼은 정상 동작함을 교차 확인
