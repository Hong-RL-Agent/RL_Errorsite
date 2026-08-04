# BUGS - site030

## site030-bug01

- bugId: `site030-bug01`
- CSV 오류명: 평점 undefined 표시
- type: `undefined-rating-render`
- 화면 위치: 멘토 카드 grid의 김도현 멘토 평점 영역
- 관련 파일: `src/components/MentorCard.jsx`, `server.js`
- data-bug-id selector: `[data-bug-id="site030-bug01"]`
- 사용자가 경험하는 증상: 평점 영역에 `평점 undefined` 텍스트가 그대로 표시된다.
- 코드상 의도된 원인: `/api/mentors`의 김도현 멘토 데이터에서 `rating` 필드가 누락되어 있고, 프론트엔드는 fallback 없이 템플릿 문자열로 렌더링한다.
- 탐지 포인트: 멘토 카드의 평점 텍스트가 숫자, 별점, 미평가 안내가 아니라 `undefined`인지 확인한다.

## site030-bug02

- bugId: `site030-bug02`
- CSV 오류명: 프로필 카드 이미지와 텍스트 겹침
- type: `profile-card-overlap`
- 화면 위치: 768px~1024px 태블릿 폭의 김도현 멘토 카드
- 관련 파일: `src/styles/responsive.css`, `src/components/MentorCard.jsx`
- data-bug-id selector: `[data-bug-id="site030-bug02"]`
- 사용자가 경험하는 증상: 특정 화면 폭에서 프로필 이미지가 이름, 분야, 설명 텍스트 영역 위로 겹쳐 카드 내용이 읽기 어렵다.
- 코드상 의도된 원인: 태블릿 media query에서 이미지 크기를 크게 만들고 텍스트 컨테이너에 음수 margin을 적용했다.
- 탐지 포인트: viewport를 768px~1024px로 조정했을 때 해당 카드 내부 요소가 서로 겹치는지 확인한다.

## site030-bug03

- bugId: `site030-bug03`
- CSV 오류명: 예약 요약 상태 불일치
- type: `booking-summary-state-mismatch`
- 화면 위치: 우측 예약 요약 패널의 선택 시간 영역
- 관련 파일: `src/components/BookingSummary.jsx`, `src/components/TimeSlotPicker.jsx`, `src/App.jsx`
- data-bug-id selector: `[data-bug-id="site030-bug03"]`
- 사용자가 경험하는 증상: 시간 슬롯 버튼을 새로 선택해도 예약 요약 패널의 선택 시간은 이전 값으로 남아 있다.
- 코드상 의도된 원인: `BookingSummary`가 `initialSlot` prop을 내부 state로 최초 한 번만 복사하고 이후 prop 변경을 반영하지 않는다.
- 탐지 포인트: 슬롯 버튼의 active 시간과 예약 요약의 `[data-bug-id="site030-bug03"]` 시간이 다른지 비교한다.
