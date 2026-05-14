# BUGS - site024 의도된 오류 상세 설명

## 1. 자막 및 스크립트 누락 (media-transcript-missing)
- **Bug ID**: site024-bug01
- **유형**: `media-transcript-missing`
- **화면 위치**: 메인 페이지 하단 "배송 서비스 안내 영상" 섹션
- **관련 컴포넌트**: `src/components/TrackingHero.jsx`
- **data-bug-id Selector**: `[data-bug-id="site024-bug01"]`
- **사용자 경험 증상**: 청각 장애가 있는 사용자가 배송 절차 안내 영상을 시청할 때, 영상의 음성 정보를 대체할 수 있는 자막(Captions)이나 전체 스크립트(Transcript)가 제공되지 않아 정보를 습득할 수 없음.
- **코드상 의도된 원인**: `video` 요소 또는 관련 안내 섹션에 텍스트 대체 수단을 고의로 누락함.
- **탐지 포인트**: 오디오/비디오 콘텐츠 존재 시 텍스트 대체 수단(자막, 대본)의 존재 여부.

## 2. 오디오 제어 기능 부재 (audio-control-missing)
- **Bug ID**: site024-bug02
- **유형**: `audio-control-missing`
- **화면 위치**: 우측 "알림 설정" 패널 내 알림음 미리보기
- **관련 컴포넌트**: `src/components/NotificationPanel.jsx`
- **data-bug-id Selector**: `[data-bug-id="site024-bug02"]`
- **사용자 경험 증상**: 배송 알림음을 미리 들어보는 기능에서 시각적으로 재생 중임이 표시되지만, 사용자가 이를 일시정지하거나 소리를 끄거나 볼륨을 조절할 수 있는 버튼이 없어 원치 않는 소리 노출에 대응할 수 없음.
- **코드상 의도된 원인**: 재생 상태만 보여주고 제어 인터페이스(Pause, Mute)를 의도적으로 구현하지 않음.
- **탐지 포인트**: 자동 재생되거나 긴 오디오 콘텐츠에 대한 사용자 제어권(중지/소리조절) 유무.

## 3. 논리적이지 않은 헤딩 구조 (illogical-heading-order)
- **Bug ID**: site024-bug03
- **유형**: `illogical-heading-order`
- **화면 위치**: 중앙 "배송 타임라인" 섹션 제목 및 상세 카드 제목
- **관련 컴포넌트**: `src/components/DeliveryTimeline.jsx`
- **data-bug-id Selector**: `[data-bug-id="site024-bug03"]`
- **사용자 경험 증상**: 스크린 리더 사용자가 헤딩(Heading) 레벨을 따라 문서를 탐색할 때, `h1` 바로 다음에 최하위 수준인 `h4`가 나오고, 다시 그 하위 요소가 상위인 `h2`로 지정되어 있어 문서의 위계 질서를 파악하기 어려움.
- **코드상 의도된 원인**: 디자인적 크기를 맞추기 위해 시각적으로만 처리하고, 실제 HTML 태그는 `h1 -> h4 -> h2` 순서로 비논리적으로 배치함.
- **탐지 포인트**: 문서 내 헤딩 레벨(`h1-h6`)의 순차적 건너뛰기 발생 여부.
