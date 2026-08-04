# BUGS

## site072-bug01

- bugId: `site072-bug01`
- CSV 오류명: 필터 결과 라벨 불일치
- type: `wine-filter-label-mismatch`
- 화면 위치: 와인 상품 안내 섹션의 결과 요약 라벨
- 관련 파일: `public/app.js`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site072-bug01"]`
- 사용자가 경험하는 증상: 사용자가 타입 필터에서 `레드`를 선택하면 실제 상품 목록은 레드 와인으로 필터링되지만 결과 요약 라벨은 `화이트`로 표시됩니다.
- 코드상 의도된 원인: `typeLabel()`의 라벨 매핑에서 `red`와 `white` 표시 값을 의도적으로 뒤바꿨습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 선택된 필터 버튼과 상품 카드 타입은 레드인데 결과 요약 텍스트만 화이트로 표시되는 상태 표시 불일치를 탐지합니다.

## site072-bug02

- bugId: `site072-bug02`
- CSV 오류명: 상품 카드 텍스트 overflow
- type: `wine-card-text-overflow`
- 화면 위치: 와인 상품 안내 grid의 `Cote d Or Heritage Pinot Noir` 상품 카드
- 관련 파일: `public/styles.css`, `public/app.js`, `server.js`
- data-bug-id selector: `[data-bug-id="site072-bug02"]`
- 사용자가 경험하는 증상: 긴 페어링 설명 문자열이 상품 카드 내부에서 줄바꿈되지 않고 옆 카드 영역까지 침범합니다.
- 코드상 의도된 원인: 해당 오류 카드의 `.wine-description`에 `white-space: nowrap`, `overflow: visible`, `max-width: none`을 지정하고 긴 단어 데이터를 제공합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 카드 경계 밖으로 텍스트가 넘어가 인접 카드 영역과 충돌하는 렌더링/레이아웃 오류를 탐지합니다.

## site072-bug03

- bugId: `site072-bug03`
- CSV 오류명: 상담 예약 버튼 무반응
- type: `consultation-reserve-button-no-response`
- 화면 위치: `Serra Verde Gran Reserva` 상품 카드의 `상담 예약` 버튼
- 관련 파일: `public/app.js`
- data-bug-id selector: `[data-bug-id="site072-bug03"]`
- 사용자가 경험하는 증상: 버튼은 활성 상담 예약 버튼처럼 보이지만 클릭해도 우측 상담 예약 요약 패널이 변경되지 않습니다.
- 코드상 의도된 원인: 특정 `wineId`인 `w-103` 버튼에만 click listener를 연결하지 않고 반환합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 상품의 상담 예약 버튼은 요약 패널을 갱신하지만 해당 상품 버튼만 클릭 후 상태 변화가 없는 이벤트 처리 오류를 탐지합니다.
