# BUGS - site016

이 문서는 PPO 에이전트 훈련을 위해 의도적으로 삽입된 GUI 오류를 설명합니다.

## 1. site016-bug01
- **Bug ID**: site016-bug01
- **Type**: SSR/CSR 하이드레이션 불일치 (frontend-state-rendering)
- **화면 위치**: 대시보드 상단 "오늘의 환율" 요약 카드
- **관련 파일**: `src/components/SummaryCards.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site016-bug01"]`
- **구현 방식**: 서버사이드 렌더링 결과(초기값)와 클라이언트 하이드레이션 이후의 돔 구조를 의도적으로 다르게 구성함. 클라이언트 렌더링 시 특정 태그가 누락되거나 순서가 바뀌어 스타일이 깨지고 텍스트가 겹치는 현상 발생.
- **PPO 에이전트 기대 행동**: 초기 로드 시 UI가 순간적으로 깜빡이거나, 최종적으로 레이아웃이 비정상적으로 틀어진 상태를 감지해야 함.

## 2. site016-bug02
- **Bug ID**: site016-bug02
- **Type**: 낙관적 업데이트 상태 불일치 (frontend-state-rendering)
- **화면 위치**: 계좌 간 "빠른 이체" 폼의 잔액 표시 영역
- **관련 파일**: `src/components/QuickTransfer.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site016-bug02"]`
- **구현 방식**: 사용자가 이체 버튼을 누르면 잔액이 즉시 차감(낙관적 업데이트)되지만, 서버 응답이 실패했을 때 이전 상태로 롤백하는 로직을 누락함. 결과적으로 실제 이체는 실패했으나 화면상 잔액은 줄어든 상태로 유지됨.
- **PPO 에이전트 기대 행동**: 액션 시도 후 에러 메시지가 떴음에도 불구하고 화면상의 숫자(잔액)가 원래대로 돌아오지 않는 상태 불일치를 감지해야 함.

## 3. site016-bug03
- **Bug ID**: site016-bug03
- **Type**: 엄격한 파싱에 의한 화면 마비 (frontend-state-rendering)
- **화면 위치**: 거래 내역 섹션 상단 "내역 새로고침" 버튼
- **관련 파일**: `src/components/TransactionList.jsx`
- **Data Bug ID Selector**: `[data-bug-id="site016-bug03"]`
- **구현 방식**: 새로고침 버튼 클릭 시 API 응답 데이터를 파싱하는 과정에서 `JSON.parse`가 예외 처리가 되지 않은 상태로 잘못된 형식의 데이터를 만나게 함. 이로 인해 JS 런타임 에러가 발생하며 이후의 모든 UI 인터랙션(탭 전환, 모달 열기 등)이 중단됨.
- **PPO 에이전트 기대 행동**: 특정 조작 이후 사이트 전체가 응답하지 않거나(Freeze), 런타임 에러로 인해 화면 일부가 화이트아웃 되는 현상을 감지해야 함.
