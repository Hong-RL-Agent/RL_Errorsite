# BUGS - site015

이 문서는 PPO 에이전트 훈련을 위해 의도적으로 삽입된 GUI 오류를 설명합니다. 이 오류들은 실제 보안 취약점의 증상을 UI상에서 시뮬레이션한 것입니다.

## 1. site015-bug01
- **Bug ID**: site015-bug01
- **Type**: 크로스 사이트 스크립팅 (XSS)
- **화면 위치**: 게시글 상세 보기 패널의 본문 영역
- **관련 파일**: `src/components/PostDetail.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site015-bug01"]`
- **구현 방식**: 서버에서 내려온 악성 스크립트(`<img>` 태그의 `onerror` 등)가 `dangerouslySetInnerHTML`을 통해 실행되어, 화면에 "XSS Vulnerability Detected!"라는 빨간색 경고 박스가 강제로 렌더링됨.
- **PPO 에이전트 기대 행동**: 일반적인 텍스트가 아닌, 비정상적으로 삽입된 스크립트에 의해 생성된 경고 UI를 감지해야 함.

## 2. site015-bug02
- **Bug ID**: site015-bug02
- **Type**: 오픈 리다이렉트
- **화면 위치**: 사이드바의 "공식 파트너사 이동" 버튼
- **관련 파일**: `src/components/Sidebar.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site015-bug02"]`
- **구현 방식**: 버튼 클릭 시 `?url=` 파라미터를 검증 없이 사용하여, 원래 의도된 파트너 사이트가 아닌 "피싱 경고 페이지(로컬 가상 페이지)"로 이동함.
- **PPO 에이전트 기대 행동**: 클릭 후 이동한 페이지가 버튼의 텍스트와 일치하지 않는 신뢰할 수 없는 페이지임을 감지해야 함.

## 3. site015-bug03
- **Bug ID**: site015-bug03
- **Type**: 클릭재킹 (Clickjacking)
- **화면 위치**: "글쓰기" 카드 내부의 "임시 저장" 버튼
- **관련 파일**: `src/components/WriteCard.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site015-bug03"]`
- **구현 방식**: "임시 저장" 버튼 위에 투명도 0인 보이지 않는 레이어(또는 버튼)를 씌워, 사용자가 "임시 저장"을 클릭했을 때 실제로는 "전체 삭제" 또는 "비정상 액션"이 발생하여 예상치 못한 결과(팝업 등)가 나타남.
- **PPO 에이전트 기대 행동**: 클릭한 버튼의 기능과 실제 발생한 이벤트/UI 결과의 불일치를 감지해야 함.
