# BUGS - site019 의도된 오류 상세 설명

## 1. 텍스트 크기 조절 불가 (fixed-text-size-overflow)
- **Bug ID**: site019-bug01
- **유형**: `fixed-text-size-overflow`
- **화면 위치**: 강의 그리드 내 각 강의 카드(`CourseCard`)의 제목(Title) 영역
- **관련 컴포넌트**: `src/components/CourseCard.jsx`, `src/styles/courses.css`
- **data-bug-id Selector**: `[data-bug-id="site019-bug01"]`
- **사용자 경험 증상**: 브라우저 확대 렌더링 시나 긴 강의 제목이 들어올 경우, 텍스트가 지정된 박스를 벗어나지 못하고 잘리거나(hidden) 겹쳐서 읽을 수 없음.
- **코드상 의도된 원인**: CSS에서 `.course-title`에 `height: 48px; font-size: 16px; overflow: hidden;`과 같이 고정된 수치를 강제 할당함.
- **탐지 포인트**: 접근성/반응형 웹 디자인 위반 (동적 텍스트 크기에 대응하지 못하는 레이아웃 락).

## 2. 비의미적 HTML 사용 (non-semantic-clickable-element)
- **Bug ID**: site019-bug02
- **유형**: `non-semantic-clickable-element`
- **화면 위치**: 강의 상세 모달 내 "수강 신청" 인터랙션 영역
- **관련 컴포넌트**: `src/components/CourseModal.jsx`
- **data-bug-id Selector**: `[data-bug-id="site019-bug02"]`
- **사용자 경험 증상**: 시각적으로는 완벽한 버튼 형태지만, 키보드(Tab)로 포커스할 수 없고 엔터(Enter)/스페이스바로 누를 수 없음. 마우스로만 클릭 가능함.
- **코드상 의도된 원인**: `<button>` 태그를 사용하지 않고 `<div className="btn btn-primary" onClick={...}>`를 사용함. `role="button"`과 `tabIndex="0"`, `onKeyDown` 핸들러를 고의로 생략함.
- **탐지 포인트**: 마우스 외 입력 장치 사용자 및 스크린 리더 환경의 접근성 심각한 훼손.

## 3. 키보드 포커스 트랩 및 순서 (broken-focus-order)
- **Bug ID**: site019-bug03
- **유형**: `broken-focus-order`
- **화면 위치**: 강의 상세 모달 표시 상태의 전역 키보드 네비게이션
- **관련 컴포넌트**: `src/components/CourseModal.jsx`, `src/components/Header.jsx` 등 배경 요소
- **data-bug-id Selector**: `[data-bug-id="site019-bug03"]`
- **사용자 경험 증상**: 모달이 열려 있는 상태에서 Tab 키를 누르면, 모달 내부 요소들(닫기, 찜하기, 수강신청 등) 사이를 순환하는 대신 모달 뒤편(배경)에 있는 검색창이나 헤더 메뉴들로 포커스가 빠져나감.
- **코드상 의도된 원인**: 모달 컴포넌트 렌더링 시 백그라운드 영역의 요소들에 `aria-hidden="true"` 설정이나 `tabIndex="-1"` 처리를 하지 않고, 포커스 트랩(Focus Trap) 로직을 의도적으로 적용하지 않음.
- **탐지 포인트**: 사용자 인터페이스 맥락 상실을 유발하는 모달 다이얼로그 키보드 이동 오류.
