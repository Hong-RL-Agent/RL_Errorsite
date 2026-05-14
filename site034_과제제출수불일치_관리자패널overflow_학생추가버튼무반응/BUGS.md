# BUGS - site034

## site034-bug01

- bugId: `site034-bug01`
- CSV 오류명: 과제 제출 수 불일치
- type: `assignment-count-mismatch`
- 화면 위치: 과제 제출 현황 첫 번째 카드의 제출 수
- 관련 파일: `src/components/AssignmentPanel.jsx`, `src/components/StudentTable.jsx`
- data-bug-id selector: `[data-bug-id="site034-bug01"]`
- 사용자가 경험하는 증상: 과제 카드에는 28명 제출로 보이지만 학생 테이블에서 제출 완료로 필터링하면 더 적은 수만 표시된다.
- 코드상 의도된 원인: 과제 카드는 API summary 값을 사용하고 학생 테이블은 학생 배열의 `submitted` 값을 기준으로 필터링한다.
- 탐지 포인트: 제출 수 카드와 제출 완료 필터 결과 row 수를 비교한다.

## site034-bug02

- bugId: `site034-bug02`
- CSV 오류명: 관리자 패널 overflow
- type: `admin-panel-overflow`
- 화면 위치: 우측 `오늘 처리할 작업` sticky 패널
- 관련 파일: `src/styles/panels.css`, `src/components/TaskPanel.jsx`
- data-bug-id selector: `[data-bug-id="site034-bug02"]`
- 사용자가 경험하는 증상: 작업 목록이 길어질 때 패널 밖으로 넘치고 하단 영역을 침범한다.
- 코드상 의도된 원인: 고정 height를 주고 내부 스크롤 처리를 누락했다.
- 탐지 포인트: 작업 리스트가 패널 경계 밖으로 내려가는지 확인한다.

## site034-bug03

- bugId: `site034-bug03`
- CSV 오류명: 학생 추가 버튼 무반응
- type: `add-student-button-no-response`
- 화면 위치: 학생 테이블 상단 toolbar의 `학생 추가` 버튼
- 관련 파일: `src/components/StudentTable.jsx`
- data-bug-id selector: `[data-bug-id="site034-bug03"]`
- 사용자가 경험하는 증상: 버튼은 활성 상태처럼 보이지만 클릭해도 학생 추가 모달이나 drawer가 열리지 않는다.
- 코드상 의도된 원인: 버튼에 빈 onClick handler를 연결했다.
- 탐지 포인트: 버튼 클릭 전후 DOM 변화나 모달 open 상태 변화가 없는지 확인한다.
