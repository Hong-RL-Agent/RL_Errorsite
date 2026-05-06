# BUGS - site026 의도된 오류 상세 설명

## 1. 폼 검증 메시지 연결 오류 (validation-message-disconnect)
- **Bug ID**: site026-bug01
- **유형**: `validation-message-disconnect`
- **화면 위치**: 메인 설문 시작 전 응답자 정보 입력 폼 (이메일 필드)
- **관련 컴포넌트**: `src/components/RespondentForm.jsx`
- **data-bug-id Selector**: `[data-bug-id="site026-bug01"]`
- **사용자 경험 증상**: 이메일 형식이 잘못되었을 때 시각적으로는 "올바른 이메일 형식이 아닙니다"라는 빨간색 메시지가 표시되지만, 스크린 리더와 같은 보조기기는 이 메시지가 이메일 입력 칸과 연관되어 있음을 인지하지 못함 (전용 포커스 시 메시지를 읽어주지 않음).
- **코드상 의도된 원인**: `input` 요소에 `aria-describedby` 속성을 누락하여 에러 텍스트의 `id`와 연결하지 않음.
- **탐지 포인트**: 에러 메시지 텍스트의 가시성과 폼 컨트롤 간의 시맨틱 연결 여부.

## 2. 진행률 상태 불일치 (progress-state-mismatch)
- **Bug ID**: site026-bug02
- **유형**: `progress-state-mismatch`
- **화면 위치**: 설문 진행 중 상단 진행률 바 (Progress Bar)
- **관련 컴포넌트**: `src/components/ProgressBar.jsx`
- **data-bug-id Selector**: `[data-bug-id="site026-bug02"]`
- **사용자 경험 증상**: 사용자가 "다음" 버튼을 눌러 다음 질문으로 이동하면 화면 중앙의 질문 내용은 바뀌지만, 상단의 진행률 바와 "N/M 질문 중" 텍스트는 이전 단계에 머물러 있어 진행 상황을 오인하게 만듬.
- **코드상 의도된 원인**: `currentQuestion` 상태 변화에 따라 진행률 상태를 동기화하여 업데이트하지 않고 초기 상태나 지연된 상태를 유지함.
- **탐지 포인트**: 현재 페이지 상태(질문 번호)와 시각적 인디케이터(진행률 바)의 데이터 일치 여부.

## 3. 제출 버튼 활성화 조건 오류 (submit-enabled-state-error)
- **Bug ID**: site026-bug03
- **유형**: `submit-enabled-state-error`
- **화면 위치**: 설문 마지막 단계 우측 하단 "설문 제출" 버튼
- **관련 컴포넌트**: `src/components/SurveyQuestionCard.jsx`
- **data-bug-id Selector**: `[data-bug-id="site026-bug03"]`
- **사용자 경험 증상**: 모든 필수 질문에 답해야 제출이 가능해야 함에도 불구하고, 마지막 필수 질문에 답하지 않은 상태에서 "설문 제출" 버튼이 이미 활성화(클릭 가능)된 것처럼 보임. 클릭 시에는 오류가 발생하거나 빈 값이 전송될 수 있음.
- **코드상 의도된 원인**: 필수 답변 체크 로직(`isComplete`)에서 마지막 인덱스의 질문 검사를 의도적으로 누락하여 활성화 상태를 잘못 계산함.
- **탐지 포인트**: 폼 완료 조건과 제출 버튼의 `disabled` 속성 및 시각적 활성 상태 간의 논리적 일치성.
