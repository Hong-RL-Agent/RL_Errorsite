# BUGS - site020 의도된 오류 상세 설명

## 1. 대체 텍스트 누락 (missing-image-alt)
- **Bug ID**: site020-bug01
- **유형**: `missing-image-alt`
- **화면 위치**: 메인 화면의 각 호텔 카드 썸네일 이미지 영역
- **관련 컴포넌트**: `src/components/HotelCard.jsx`
- **data-bug-id Selector**: `[data-bug-id="site020-bug01"]`
- **사용자 경험 증상**: 시각 장애인이 스크린 리더를 사용하여 호텔 리스트를 탐색할 때, 이미지가 무엇을 나타내는지(어느 호텔 전경인지) 설명을 듣지 못함.
- **코드상 의도된 원인**: `<img>` 태그에 필수적인 `alt` 속성을 의도적으로 부여하지 않음.
- **탐지 포인트**: 이미지 요소에 `alt` 텍스트 부재.

## 2. 레이블과 입력창 연결 누락 (label-input-disconnect)
- **Bug ID**: site020-bug02
- **유형**: `label-input-disconnect`
- **화면 위치**: 메인 상단의 검색 바(Search Bar) 내부 '체크인 날짜' 선택기
- **관련 컴포넌트**: `src/components/SearchBar.jsx`
- **data-bug-id Selector**: `[data-bug-id="site020-bug02"]`
- **사용자 경험 증상**: '체크인' 텍스트 레이블을 마우스로 클릭하거나 터치했을 때 날짜 선택 달력이 뜨거나 포커스가 되지 않음. (반면 체크아웃은 정상 동작)
- **코드상 의도된 원인**: `<label htmlFor="checkin-date-wrong">`과 `<input id="checkin-date">` 처럼 서로 다른 ID 값을 매핑함.
- **탐지 포인트**: `label`의 `for`/`htmlFor` 값이 문서 내에 존재하는 어떤 폼 컨트롤 요소의 `id`와도 일치하지 않는 접근성 오류.

## 3. 자동완성 미지원 (autocomplete-missing)
- **Bug ID**: site020-bug03
- **유형**: `autocomplete-missing`
- **화면 위치**: 객실 예약 진행 폼(모달 내 '예약자 정보' 섹션)
- **관련 컴포넌트**: `src/components/GuestForm.jsx`
- **data-bug-id Selector**: `[data-bug-id="site020-bug03"]`
- **사용자 경험 증상**: 예약 시 이름, 전화번호, 이메일을 묻는 입력란에서 브라우저가 제공하는 기존 정보 자동완성 드롭다운이 나타나지 않아 매번 전부 직접 쳐야 함.
- **코드상 의도된 원인**: `<input name="email" type="email">` 등에 `autocomplete="email"`이나 `autocomplete="name"` 속성을 누락하여 브라우저의 편의 기능을 의도적으로 차단함.
- **탐지 포인트**: 사용자 정보(이름, 주소, 전화번호, 이메일 등)를 요구하는 폼에서 `autocomplete` 속성이 식별되지 않음.
