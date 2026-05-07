# BUGS site068

### site068-bug01
- **유형**: question-order-shuffle-mismatch
- **한국어 유형**: 문항 순서 셔플 불일치
- **API**: `/api/quiz/start`
- **증상**: 문제를 풀 때 셔플된 순서로 풀었지만, 채점 시 서버는 원래 정적 순서와 비교하여 정답인데도 오답 처리함.

### site068-bug02
- **유형**: score-accumulation-skip
- **한국어 유형**: 점수 누적 누락
- **API**: `/api/quiz/result`
- **증상**: 채점 반복문 내부 로직 오류로 인해 특정 인덱스의 문제 점수가 합계에 포함되지 않아 실제보다 점수가 낮게 나옴.

### site068-bug03
- **유형**: partial-grading-logic-error
- **한국어 유형**: 부분 채점 로직 오류
- **API**: `/api/quiz/review`
- **증상**: 복수 선택 문제에서 일부 정답을 맞혔음에도 불구하고, 로직상 '하나라도 틀리면 0점' 처리되어 부분 점수가 반영되지 않음.

### site068-bug04
- **유형**: submission-status-flag-inversion
- **한국어 유형**: 제출 상태 플래그 반전
- **API**: `/api/quiz/submit`
- **증상**: 답안 제출이 성공했음에도 불구하고 DB(메모리) 상의 제출 플래그가 `false`로 저장되어 메인 화면에서 '미제출' 상태로 표시됨.
