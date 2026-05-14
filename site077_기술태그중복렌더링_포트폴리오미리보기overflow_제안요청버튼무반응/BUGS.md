# BUGS.md - 의도된 프론트엔드 오류 리스트

이 파일은 `site077`에 의도적으로 포함된 3가지 GUI 오류를 기록합니다.

---

## 1. 기술 태그 중복 렌더링
- **bugId**: `site077-bug01`
- **CSV 오류명**: 기술 태그 중복 렌더링
- **Type**: `duplicate-skill-tag-render`
- **화면 위치**: 프리랜서 카드 중앙의 기술 스택(Tags) 영역
- **관련 파일**: `public/app.js`
- **data-bug-id selector**: `[data-bug-id="site077-bug01"]`
- **사용자 경험 증상**: 프리랜서 카드를 볼 때, "Figma, Adobe XD, Figma"처럼 첫 번째 기술 태그가 마지막에 한 번 더 중복해서 나타남.
- **코드상 의도된 원인**: `renderSkillTags` 함수에서 `map`으로 생성된 HTML 뒤에 첫 번째 인덱스의 태그를 수동으로 한 번 더 append함.
- **PPO 에이전트 기대 행동**: 같은 텍스트를 가진 태그 요소가 동일 부모 내에 중복 존재하는지 탐지해야 함.

## 2. 포트폴리오 미리보기 overflow
- **bugId**: `site077-bug02`
- **CSV 오류명**: 포트폴리오 미리보기 overflow
- **Type**: `portfolio-preview-overflow`
- **화면 위치**: 프리랜서 상세 모달의 포트폴리오 탭 영역
- **관련 파일**: `public/styles.css`, `public/index.html`
- **data-bug-id selector**: `[data-bug-id="site077-bug02"]`
- **사용자 경험 증상**: 전문가 상세 보기 클릭 시, 포트폴리오 이미지가 너무 커서 하얀 모달 박스 밖으로 튀어나와 보임.
- **코드상 의도된 원인**: `.portfolio-img`에 `width: 1200px` 고정값을 부여하고, 부모 요소나 모달에 `overflow: hidden` 또는 `max-width: 100%` 처리를 누락함.
- **PPO 에이전트 기대 행동**: 이미지의 크기가 부모(모달)의 Bounding Box를 벗어나는지 레이아웃 계산을 통해 탐지해야 함.

## 3. 제안 요청 버튼 무반응
- **bugId**: `site077-bug03`
- **CSV 오류명**: 제안 요청 버튼 무반응
- **Type**: `proposal-request-button-no-response`
- **화면 위치**: 'Marcus Thorne' 프리랜서 카드의 '제안 요청' 버튼
- **관련 파일**: `public/app.js`
- **data-bug-id selector**: `[data-bug-id="site077-bug03"]`
- **사용자 경험 증상**: 버튼은 클릭 가능한 파란색으로 활성화되어 있으나, 클릭해도 우측 "선택한 전문가" 패널에 추가되지 않음.
- **코드상 의도된 원인**: `renderFreelancers` 함수에서 `id === 3`인 전문가의 버튼에만 `onclick` 리스너를 연결하지 않고 건너뜀.
- **PPO 에이전트 기대 행동**: 특정 요소 클릭 후 연관된 UI(우측 패널)의 변화가 없는 상태를 탐지해야 함.
