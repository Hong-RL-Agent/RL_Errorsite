# PulseForm (C-09) Unseen Test Environment Bug Specification

## 사이트 개요
- **Site ID**: C-09
- **Service Name**: PulseForm (차세대 설문 & 리서치 플랫폼)
- **Role**: DQN Unseen Generalization Test Environment
- **Strategies Covered**: `ACTION_REPLAY`, `SEQUENCE_REPLAY`, `STATE_REVISIT`
- **Frontend**: `http://localhost:5181`
- **Backend**: `http://localhost:5008`
- **Database**: SQLite (`backend/data/pulseform.db`)

---

## 1. BUG 1 — Survey Question Branching Bug

```text
bug_id:
C-09-821

error_name:
Survey Question Branching Bug

strategy:
SEQUENCE_REPLAY

confirmation_strategy:
Sequence + DOM Question Verification

precondition:
설문 응답 화면(1단계)에서 1번 문항(Q1. 최근 6개월 내 본 서비스를 이용한 경험이 있습니까?)이 활성화되어 있다.

trigger:
1. 1번 문항에서 "아니오 (이용 경험 없음)" (점수 score = 1) 선택
2. [응답 계속하기] 버튼 클릭

normal_behavior:
Branch Rule(score < 2)에 따라 미이용 사유를 묻는 3번 문항(Q3)으로 즉시 분기되어야 한다.

actual_error_behavior:
Branching 조건식의 관계 연산자가 반대로 구현되어(score > 2), 점수 1인 응답이 분기 조건을 통과하지 못하고 2번 문항(Q2. 유입 경로)으로 잘못 이동한다.

required_evidence:
- DOM 현재 문항: 2 / 5
- DOM 렌더링 질문: "Q2. 어떤 경로를 통해 본 서비스를 처음 접하게 되었습니까?"

verification_method:
Q1에서 '아니오' 선택 → [응답 계속하기] 클릭 → DOM에 렌더링된 질문이 Q3가 아닌 Q2인지 확인
```

---

## 2. BUG 2 — Matrix Choice Submission Drop

```text
bug_id:
C-09-868

error_name:
Matrix Choice Submission Drop

strategy:
ACTION_REPLAY

confirmation_strategy:
Action + Network 400 Bad Request

precondition:
설문 5단계 5지선다 척도형 문항(Q5. 전반적인 품질 및 만족도)에 도달한 상태이다.

trigger:
척도 옵션 중 3점 "보통" 버튼을 클릭한다.

normal_behavior:
선택한 3점 보통 옵션이 백엔드 세션 응답에 정상적으로 저장되고 200 OK가 반환되어야 한다.

actual_error_behavior:
Frontend는 선택값을 "NORMAL"로 전송하지만, Backend는 "AVERAGE" enum만을 유효값으로 기대하여 불일치가 발생하고 400 Bad Request를 반환한다.

required_evidence:
- Network Request: POST /v1/sessions/:sessionId/answers { "itemId": "q5", "value": "NORMAL" }
- Network Response: 400 Bad Request

verification_method:
5번 문항에서 3점 '보통' 선택 → 개발자도구/Network 탭에서 400 Bad Request 응답 수신 확인
```

---

## 3. BUG 3 — Survey Multi-step Back Bug

```text
bug_id:
C-09-1656

error_name:
Survey Multi-step Back Bug

strategy:
SEQUENCE_REPLAY

confirmation_strategy:
Sequence + DOM State (Textarea Value Loss)

precondition:
4단계 텍스트 입력 문항(Q4)까지 순차적으로 진입한 상태이다.

trigger:
1. 4단계 textarea에 "서비스에서 개선되었으면 하는 점: 검색 기능이 더 빨랐으면 좋겠습니다." 입력
2. [응답 계속하기] 클릭하여 5단계로 이동
3. 5단계에서 [이전 문항] 버튼을 클릭하여 4단계로 복귀

normal_behavior:
이전 단계로 돌아왔을 때 사용자가 입력했던 텍스트("검색 기능이 더 빨랐으면 좋겠습니다.")가 textarea에 유지되어야 한다.

actual_error_behavior:
멀티스텝 상태 관리에서 이전 단계 복귀 시 텍스트 상태가 빈 문자열("")로 초기화된다.

required_evidence:
- Before Next: textarea.value = "검색 기능이 더 빨랐으면 좋겠습니다."
- After Back: textarea.value = "" (빈 텍스트 필드)

verification_method:
텍스트 입력 → [응답 계속하기] → [이전 문항] → textarea 값 소실 확인
```

---

## 4. BUG 4 — Survey Response Counter Inconsistency

```text
bug_id:
C-09-014

error_name:
Survey Response Counter Inconsistency

strategy:
STATE_REVISIT

confirmation_strategy:
Submit + Revisit + Statistics DOM Comparison

precondition:
초기 상태에서 전체 응답자 수 100명, 문항별 응답 합계 100건이 등록되어 있다.

trigger:
1. 설문 응답을 끝까지 작성하고 검토 화면에서 [응답 제출] 클릭
2. 완료 화면 확인 후 상단 네비게이션에서 [통계 대시보드]로 이동

normal_behavior:
총 응답자 수가 101명으로 증가하면, 문항별 응답 합계(Q1, Q2, Q5 등)도 일관되게 101건으로 증가해야 한다.

actual_error_behavior:
설문 완료 API(POST /v1/sessions/:sessionId/complete)가 submission_records 테이블은 갱신(101명)하지만, question_statistics 테이블 업데이트를 누락하여 문항별 응답 합계는 100건으로 유지된다.

required_evidence:
- DOM 총 응답자 수: 101명
- DOM 문항별 응답 합계: 100명 (불일치)

verification_method:
설문 1건 제출 완료 → [통계 대시보드] 이동 → 총 응답자 수(101)와 문항별 합계(100)의 불일치 비교
```

---

## 5. BUG 5 — Survey Submit Freeze

```text
bug_id:
C-09-1855

error_name:
Survey Submit Freeze

strategy:
ACTION_REPLAY

confirmation_strategy:
Repeated Action + UI Response Freeze

precondition:
필수 문항이 미입력된 상태이다.

trigger:
필수 문항이 비어있는 상태에서 [응답 계속하기] 또는 [응답 제출] 버튼을 빠르게 연속 3회 이상 클릭한다.

normal_behavior:
"필수 문항을 입력해주세요." validation 메시지가 노출되고, 이후 사용자가 옵션을 선택하거나 문항을 입력할 수 있어야 한다.

actual_error_behavior:
연속 클릭으로 인한 충돌성 상태 전이 루프가 발생하여 액티브 입력 상태 락(`isFrozen = true`)이 걸리고, 이후 라디오 선택, 텍스트 입력, 버튼 클릭 등 모든 사용자 입력에 대해 DOM과 State가 반응하지 않는다.

required_evidence:
- validation 메시지 노출 후 추가적인 라디오/텍스트 조작 시 DOM 변화 없음 (Freeze)

verification_method:
필수 문항 미입력 상태에서 버튼 연속 클릭 → 이후 옵션 선택 시도 시 라디오 체크 및 UI 변경 미발생 확인
```

---

## 6. Deterministic Reset API
- **Endpoint**: `POST http://localhost:5008/v1/test/reset`
- **Action**: 설문 세션, 제출 기록(100건), 문항별 통계 데이터를 초기 Seed 상태로 100% 원복.
