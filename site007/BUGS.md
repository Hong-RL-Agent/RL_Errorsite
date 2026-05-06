# BUGS.md - site007

## 의도된 GUI 오류 목록

---

### bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site007-bug01 |
| **type** | button-no-response |
| **화면 위치** | 우측 예약 폼 하단의 "예약 확정" 버튼 |
| **관련 파일** | `src/components/BookingForm.jsx` |
| **data-bug-id selector** | `[data-bug-id="site007-bug01"]` |
| **사용자가 경험하는 증상** | 의료진과 방문 시간을 선택하고 환자 정보를 입력한 후 "예약 확정" 버튼을 클릭해도 아무런 예약 완료 메시지나 화면 전환이 일어나지 않음. |
| **코드상 의도된 원인** | `<button>`의 `onClick` 이벤트 핸들러에 실제 예약 API 호출이나 알림(`alert`, `toast` 등)을 띄우는 로직 대신 빈 함수 `() => {}`가 할당되어 있어 클릭 이벤트가 무시됨. |
| **PPO 에이전트 기대 행동** | 마우스 클릭 이벤트를 발생시켰음에도 불구하고 네트워크 통신이나 UI 상태 변화가 없음을 감지하여 무반응 결함으로 판단. |

---

### bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site007-bug02 |
| **type** | component-rendering |
| **화면 위치** | 좌측 본문의 의사 목록 리스트 |
| **관련 파일** | `src/components/DoctorList.jsx` |
| **data-bug-id selector** | `[data-bug-id="site007-bug02"]` |
| **사용자가 경험하는 증상** | 의사 목록을 볼 때 "박의사 (피부과)" 카드가 똑같은 내용으로 두 번 중복해서 렌더링되어 표시됨. |
| **코드상 의도된 원인** | 서버에서 받은 의사 목록 배열을 렌더링하기 직전에, `id === 3`인 "박의사" 객체를 찾아 강제로 배열의 맨 끝에 한 번 더 `push` 하도록 로직을 작성하여 중복 렌더링을 유발함. |
| **PPO 에이전트 기대 행동** | 시각적으로 동일한 컴포넌트 콘텐츠(이미지, 텍스트)가 연달아 중복 배치되었음을 렌더링 트리와 픽셀 매칭을 통해 중복 출력 에러로 식별. |

---

### bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site007-bug03 |
| **type** | css-layout |
| **화면 위치** | 우측 예약 정보 입력 폼의 "환자 성함" 입력란 |
| **관련 파일** | `src/styles/main.css`, `src/components/BookingForm.jsx` |
| **data-bug-id selector** | `[data-bug-id="site007-bug03"]` |
| **사용자가 경험하는 증상** | 환자 성함 라벨(Text)과 입력을 받는 Input Box가 상하로 분리되지 않고 동일 선상에서 겹쳐서(Overlap) 렌더링되어 글씨를 알아보기 어렵고 클릭하기 불편함. |
| **코드상 의도된 원인** | `.form-group` 클래스에 `display: flex; flex-direction: column;`을 선언했지만, 고정 높이 `height: 40px`을 부여하여 내부 요소(라벨과 인풋 박스)의 합산 높이가 컨테이너 높이를 초과하게 만들어 시각적 겹침 현상을 발생시킴. |
| **PPO 에이전트 기대 행동** | 렌더링된 텍스트 노드(`label`)의 Bounding Box와 입력 요소(`input`)의 Bounding Box가 교차(Intersect)하는 것을 파악하여 레이아웃 겹침 버그로 판별. |
