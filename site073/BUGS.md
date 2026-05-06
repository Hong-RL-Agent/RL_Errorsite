# BUGS

## site073-bug01

- bugId: `site073-bug01`
- CSV 오류명: 포트폴리오 합계 불일치
- type: `portfolio-total-mismatch`
- 화면 위치: 상단 총 자산 요약 카드
- 관련 파일: `public/app.js`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site073-bug01"]`
- 사용자가 경험하는 증상: 보유 종목 테이블의 평가금액을 모두 합산한 금액과 상단 총 자산 카드의 금액이 서로 다르게 표시됩니다.
- 코드상 의도된 원인: `renderSummaryCards()`에서 총 자산 계산 시 `state.holdings.slice(0, -1)`을 사용해 마지막 보유 항목을 제외합니다.
- PPO 에이전트가 탐지해야 할 기대 행동: API와 테이블 데이터는 정상인데 상단 총액만 한 종목 금액만큼 낮게 표시되는 상태/계산 불일치를 탐지합니다.

## site073-bug02

- bugId: `site073-bug02`
- CSV 오류명: 테이블 컬럼 overflow
- type: `holdings-table-overflow`
- 화면 위치: 보유 종목 테이블의 우측 마지막 컬럼
- 관련 파일: `public/styles.css`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site073-bug02"]`
- 사용자가 경험하는 증상: 보유 종목 테이블의 고정 폭이 본문 영역보다 넓지만 가로 스크롤이 없어 마지막 컬럼 일부가 잘립니다.
- 코드상 의도된 원인: `.holdings-table`에 `width: 1280px`와 `table-layout: fixed`를 지정하고, `.table-card[data-bug-id="site073-bug02"]`에 `overflow: hidden`을 적용했습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 데스크톱 화면에서 우측 요약 패널 때문에 본문 폭이 제한되고, 테이블 마지막 컬럼이 잘리는 레이아웃 오류를 탐지합니다.

## site073-bug03

- bugId: `site073-bug03`
- CSV 오류명: 리포트 다운로드 버튼 무반응
- type: `report-download-button-no-response`
- 화면 위치: 리스크 안내 카드의 `리포트 다운로드` 버튼
- 관련 파일: `public/app.js`, `public/index.html`
- data-bug-id selector: `[data-bug-id="site073-bug03"]`
- 사용자가 경험하는 증상: 버튼은 활성 버튼처럼 보이지만 클릭해도 다운로드 안내 메시지나 준비 중 alert가 나타나지 않습니다.
- 코드상 의도된 원인: 실제 DOM 버튼 ID는 `reportDownloadButton`인데 app.js에서 `#downloadReportButton`으로 조회해 click listener가 연결되지 않습니다.
- PPO 에이전트가 탐지해야 할 기대 행동: 다른 준비 중 버튼은 alert를 띄우지만 해당 버튼만 클릭 후 아무 반응이 없는 이벤트 연결 오류를 탐지합니다.
