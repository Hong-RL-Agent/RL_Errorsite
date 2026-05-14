# BUGS.md - site004

## 의도된 GUI 오류 목록

---

### bug01

| 항목 | 내용 |
|------|------|
| **bugId** | site004-bug01 |
| **type** | button-no-response |
| **화면 위치** | 강의 목록 카드 하단 "수강신청" 버튼 (미수강 강의) |
| **관련 파일** | `src/components/CourseList.jsx` |
| **data-bug-id selector** | `[data-bug-id="site004-bug01"]` |
| **사용자가 경험하는 증상** | 수강 가능한 강의의 "수강신청" 버튼을 눌러도 상태가 변하지 않고, 어떠한 알림이나 팝업, 라우팅이 발생하지 않음. |
| **코드상 의도된 원인** | `<button>`의 `onClick` 이벤트에 아무런 로직이 들어있지 않은 빈 화살표 함수(`() => {}`)가 할당되어 있음. |
| **PPO 에이전트 기대 행동** | 마우스 클릭 이벤트를 트리거한 전후로 DOM 구조, CSS 클래스, 네트워크 리퀘스트 등 상태 변화가 전혀 없는 것을 '응답 없음'으로 탐지. |

---

### bug02

| 항목 | 내용 |
|------|------|
| **bugId** | site004-bug02 |
| **type** | component-rendering |
| **화면 위치** | 본문 강의 카드 목록 영역 |
| **관련 파일** | `src/components/CourseList.jsx` |
| **data-bug-id selector** | `[data-bug-id="site004-bug02"]` |
| **사용자가 경험하는 증상** | 전체 강의 목록에서 '데이터 기반 디지털 마케팅' 강의가 보여야 할 위치에 카드가 렌더링되지 않고 빈 공간 또는 아예 누락된 상태로 나타남. |
| **코드상 의도된 원인** | API에서는 해당 강의(`id: 103`) 데이터를 정상적으로 내려주지만, `map` 렌더링 루프 내부에서 `course.id === 103`일 경우 빈 `div`(`display: none`)를 반환하도록 고의로 조건부 분기를 태움. |
| **PPO 에이전트 기대 행동** | 네트워크 패킷으로 수신한 강의 데이터 배열 크기와 실제 화면에 렌더링된 유효 강의 카드(`.course-card`) 요소 개수 간의 불일치를 기반으로 렌더링 누락 버그로 판단. |

---

### bug03

| 항목 | 내용 |
|------|------|
| **bugId** | site004-bug03 |
| **type** | css-layout |
| **화면 위치** | 우측 사이드바 및 본문 우측 영역 |
| **관련 파일** | `src/styles/main.css`, `src/components/Sidebar.jsx` |
| **data-bug-id selector** | `[data-bug-id="site004-bug03"]` |
| **사용자가 경험하는 증상** | 화면 우측에 고정된 사이드바(공지사항, 프로필 등)가 강의 목록을 담고 있는 메인 영역의 우측 일부를 가려서 겹치게 됨. 이로 인해 강의 카드 일부가 클릭되지 않거나 가려짐. |
| **코드상 의도된 원인** | `.sidebar` 클래스에 `position: absolute`를 주고 `z-index: 10`을 설정하여 문서 흐름에서 띄운 뒤, 본문 영역에 적절한 `margin-right`나 패딩 여백을 주지 않아 두 영역이 겹치도록(Overlap) CSS를 작성함. |
| **PPO 에이전트 기대 행동** | `.sidebar` 컨테이너의 BoundingBox와 내부 강의 카드(`.course-card`)들의 BoundingBox가 겹치는 교차 영역을 계산하여 의도치 않은 Layout Overlap(레이아웃 깨짐)으로 분류. |
