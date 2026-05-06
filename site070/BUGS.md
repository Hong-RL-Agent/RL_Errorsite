# BUGS.md — site070 회의실 예약 웹사이트

> 이 파일은 PPO 에이전트 학습을 위한 의도된 프론트엔드 GUI 오류 명세서입니다.
> 백엔드 API는 정상 동작하며, 오류는 모두 프론트엔드 코드에만 존재합니다.

---

## bug01 — 시간 슬롯 중복 표시

| 항목 | 내용 |
|------|------|
| **bugId** | `site070-bug01` |
| **CSV 오류명** | 시간 슬롯 중복 표시 |
| **type** | `duplicate-time-slot-display` |
| **화면 위치** | 예약 일정 선택 섹션 > 시간 슬롯 패널 |
| **관련 파일** | `public/app.js` — `renderTimeSlots()` 함수 |
| **data-bug-id selector** | `[data-bug-id="site070-bug01"]` (`.time-slots-list` div) |

### 사용자가 경험하는 증상
- 회의실을 선택하고 시간 슬롯 목록을 보면 **11:00 – 12:00 슬롯이 목록 맨 아래에 한 번 더 표시**된다.
- API에서 받아온 슬롯 데이터에는 중복이 없지만, 화면에서는 동일한 시간대가 두 번 나타난다.
- 중복된 슬롯을 클릭하면 예약 요약 패널이 정상적으로 업데이트된다 (버튼 자체는 작동).
- 날짜를 변경해도 슬롯 리스트를 다시 불러올 때마다 중복이 반복된다.

### 코드상 의도된 원인
```javascript
// app.js — renderTimeSlots()
// API에서 받은 slots를 정상 렌더링 후, slots[2](11:00)를 추가로 append
if (slots.length >= 3) {
  const dupEl = createSlotEl(slots[2]); // 중복 추가 (intentional bug)
  list.appendChild(dupEl);
}
```

### PPO 에이전트가 탐지해야 할 기대 행동
- 시간 슬롯 목록에서 동일한 시간(11:00 – 12:00)이 두 번 렌더링됨을 감지
- `[data-bug-id="site070-bug01"]` 컨테이너 내 `.time-slot` 요소 중 동일한 `.slot-time` 텍스트가 2개 이상 존재하는지 확인
- API 응답의 `data` 배열 길이(10)와 실제 렌더링된 슬롯 수(11)가 불일치함을 탐지

---

## bug02 — 달력 grid overflow

| 항목 | 내용 |
|------|------|
| **bugId** | `site070-bug02` |
| **CSV 오류명** | 달력 grid overflow |
| **type** | `booking-calendar-grid-overflow` |
| **화면 위치** | 예약 일정 선택 섹션 > 예약 캘린더 |
| **관련 파일** | `public/styles.css` — `.calendar-grid`, `.calendar-day` 규칙 |
| **data-bug-id selector** | `[data-bug-id="site070-bug02"]` (`#calendar-grid` div) |

### 사용자가 경험하는 증상
- 예약 캘린더가 **컨테이너 경계를 벗어나 우측 패널 영역 아래로 넘친다**.
- 7개의 날짜 열이 고정 폭(148px × 7 = 1036px)으로 렌더링되어 부모 컨테이너(~740px)를 초과한다.
- overflow 처리가 없어 캘린더가 시각적으로 우측 예약 요약 패널과 겹치거나 패널 아래로 흘러내린다.
- 화면을 좌우로 스크롤하면 넘친 날짜 셀들이 보인다.

### 코드상 의도된 원인
```css
/* styles.css */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 148px); /* Bug: fixed px 합계 1036px */
  gap: 2px;
  /* Bug: overflow: hidden 누락 */
}
.calendar-day {
  width: 148px; /* Bug: fixed px width */
}
```

### PPO 에이전트가 탐지해야 할 기대 행동
- `#calendar-grid`의 실제 렌더링 너비가 부모 컨테이너 너비를 초과하는지 감지
- `scrollWidth > clientWidth` 조건으로 overflow 여부 탐지
- 날짜 셀이 부모 컨테이너의 오른쪽 경계를 넘어 렌더링되는지 확인
- `data-bug-id="site070-bug02"` 요소의 bounding rect가 부모 영역을 벗어나는지 탐지

---

## bug03 — 예약 버튼 무반응

| 항목 | 내용 |
|------|------|
| **bugId** | `site070-bug03` |
| **CSV 오류명** | 예약 버튼 무반응 |
| **type** | `meeting-room-book-button-no-response` |
| **화면 위치** | 회의실 카드 그리드 > 넥스트 라운지 카드 (room-03) |
| **관련 파일** | `public/app.js` — `renderRoomCards()` 함수 |
| **data-bug-id selector** | `[data-bug-id="site070-bug03"]` (넥스트 라운지 예약하기 버튼) |

### 사용자가 경험하는 증상
- "넥스트 라운지" 회의실 카드의 **"예약하기" 버튼이 정상처럼 보이지만 클릭해도 아무 반응이 없다**.
- 다른 회의실(이노베이션 룸, 크리에이티브 스튜디오 등)의 예약하기 버튼은 정상적으로 예약 섹션으로 이동하고 요약 패널이 업데이트된다.
- 넥스트 라운지의 "상세보기" 버튼은 정상 동작하며 모달이 열린다.
- 모달에서 "이 회의실 예약하기"를 누르면 정상적으로 예약 섹션으로 이동한다 (모달 경로는 정상).

### 코드상 의도된 원인
```javascript
// app.js — renderRoomCards()
const bookBtn = card.querySelector('.btn-book:not(.disabled)');
if (bookBtn && room.id !== 'room-03') {
  // 정상 회의실만 click listener 연결
  bookBtn.addEventListener('click', () => selectRoom(room));
}
// room-03: click listener를 의도적으로 연결하지 않음 → 클릭 이벤트 없음
```

### PPO 에이전트가 탐지해야 할 기대 행동
- `[data-bug-id="site070-bug03"]` 버튼 클릭 후 예약 섹션(#booking-section)이 활성화되지 않는지 감지
- 해당 버튼에 click 이벤트 리스너가 등록되어 있지 않음을 탐지
- 클릭 전후로 DOM 상태(booking-section.active 클래스, 요약 패널 내용) 변화가 없음을 비교
- 동일 스타일의 다른 예약 버튼은 정상 동작하지만 해당 버튼만 무반응임을 비교 탐지
