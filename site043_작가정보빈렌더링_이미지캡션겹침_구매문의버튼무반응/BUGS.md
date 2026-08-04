# site043 Intentional Frontend Bugs

## site043-bug01
- bugId: `site043-bug01`
- CSV 오류명: 작가 정보 빈 렌더링
- type: `empty-artist-info-render`
- 화면 위치: `Mirror Index` 작품 상세 모달의 작가 정보 영역
- 관련 파일: `src/components/ArtworkModal.jsx`
- data-bug-id selector: `[data-bug-id="site043-bug01"]`
- 사용자가 경험하는 증상: `Mirror Index` 상세 모달을 열면 작품 정보는 보이지만 작가 정보 패널 내부가 비어 보인다.
- 코드상 의도된 원인: API의 작품 데이터와 작가 데이터는 정상 제공되지만, 특정 작품에서만 `artist.id === artwork.artistId` 엄격 비교를 사용해 숫자/문자열 타입 불일치가 발생한다.
- PPO 에이전트가 탐지해야 할 기대 행동: 작품 카드 상세 모달을 열고 작품별 작가 정보 영역이 API의 `artistId`와 일관되게 채워지는지 비교한다.

## site043-bug02
- bugId: `site043-bug02`
- CSV 오류명: 이미지 캡션 겹침
- type: `artwork-caption-overlap`
- 화면 위치: 작품 grid의 `Paper Latitude` 카드 캡션
- 관련 파일: `src/components/ArtworkCard.jsx`, `src/styles/artwork.css`
- data-bug-id selector: `[data-bug-id="site043-bug02"]`
- 사용자가 경험하는 증상: 특정 작품 카드의 캡션이 이미지와 카드 바깥 영역으로 과도하게 겹쳐 주변 카드 영역을 침범한다.
- 코드상 의도된 원인: 해당 카드 캡션에 `position: absolute`, 잘못된 `right`와 `bottom` 값을 적용해 카드 내부 흐름에서 벗어나게 했다.
- PPO 에이전트가 탐지해야 할 기대 행동: 1440px 데스크톱 폭에서 작품 grid를 관찰하고 캡션 박스가 이미지 및 인접 카드 영역과 겹치는지 감지한다.

## site043-bug03
- bugId: `site043-bug03`
- CSV 오류명: 구매 문의 버튼 무반응
- type: `inquiry-button-no-response`
- 화면 위치: 작품 grid의 `Garden Draft` 카드 `구매 문의` 버튼
- 관련 파일: `src/components/ArtworkCard.jsx`
- data-bug-id selector: `[data-bug-id="site043-bug03"]`
- 사용자가 경험하는 증상: 다른 작품의 `구매 문의` 버튼은 drawer를 열지만 `Garden Draft` 버튼은 클릭해도 아무 변화가 없다.
- 코드상 의도된 원인: 특정 artworkId에만 빈 handler를 연결해 drawer open 함수가 호출되지 않는다.
- PPO 에이전트가 탐지해야 할 기대 행동: 여러 작품의 문의 버튼 클릭 결과를 비교해 특정 버튼만 drawer를 열지 못하는 이벤트 오류를 탐지한다.
