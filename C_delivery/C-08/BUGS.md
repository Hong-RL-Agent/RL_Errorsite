# StayMeet (C-08) Validation Environment Bug Specification

## 사이트 개요
- **Site ID**: C-08
- **Service Name**: StayMeet (스마트 공간 & 숙소 통합 예약 관리 플랫폼)
- **Role**: DQN Validation Environment
- **Strategies Covered**: `ACTION_REPLAY`, `SEQUENCE_REPLAY`, `STATE_REVISIT`
- **Frontend**: `http://localhost:5180`
- **Backend**: `http://localhost:5007`
- **Database**: SQLite (`backend/data/staymeet.db`)

---

## 1. BUG 1 — Double Booking Collision

```text
bug_id: C-08-439

error_name:
Double Booking Collision

strategy:
ACTION_REPLAY

confirmation_strategy:
Network + DOM

precondition:
Aurora Meeting Room (101번 공간)의 2026-10-15 14:00~15:00 시간대에 기존 예약(#1001)이 CONFIRMED 상태로 존재한다.

trigger:
타임라인 또는 공간 예약 모달에서 동일 공간의 14:00~15:00 시간대를 선택하고 [예약 확인] 버튼을 클릭하여 예약을 제출한다.

normal_behavior:
중복된 시간대 예약 요청을 감지하여 409 Conflict 또는 예약 불가 에러를 반환하고 예약을 차단한다.

actual_error_behavior:
Backend 예약 생성 API가 기존 예약 중복 검사 쿼리를 누락하여 201 Created로 처리하고, 동일 시간대에 중복 예약이 생성된다.

required_evidence:
- Network: POST /api/reservations → Status 201 Created
- DOM: 타임라인 화면에서 14:00~15:00 슬롯에 중복 예약 블록 2개가 동시에 렌더링됨

verification_method:
기존 예약 상태 확인 → 동일 시간대(14:00~15:00) 선택 → [예약 확인] 클릭 → Network 201 응답 및 타임라인 슬롯 내 2개 예약 카드 확인
```

---

## 2. BUG 2 — Timezone Shift Bug

```text
bug_id: C-08-158

error_name:
Timezone Shift Bug

strategy:
ACTION_REPLAY

confirmation_strategy:
Input State + DOM

precondition:
사용자가 공간 예약 화면에서 날짜와 시간을 선택할 수 있는 상태이다.

trigger:
달력/시간 선택기에서 "2026-10-15 10:00"을 선택한 뒤 [일정 저장] 및 [예약 확인] 버튼을 클릭한다.

normal_behavior:
사용자가 선택한 시간대인 "2026-10-15 10:00"이 DB에 보존되고 화면 결과 카드에도 "2026-10-15 10:00"으로 표시되어야 한다.

actual_error_behavior:
KST(+09:00) 처리 과정에서 UTC 변환이 역방향/오적용되어 9시간 이전 시간인 "2026-10-15 01:00"으로 변환되어 저장/응답된다.

required_evidence:
- DOM 입력/선택 값: "2026-10-15 10:00"
- DOM 예약 완료 카드 결과 값: "2026-10-15 01:00:00"

verification_method:
날짜/시간 "2026-10-15 10:00" 선택 → [일정 저장] → [예약 확인] → 예약 완료 카드에 표시된 결과 시간(01:00)과 선택 시간(10:00)의 불일치 관찰
```

---

## 3. BUG 3 — Seat Option Multiplier Failure

```text
bug_id: C-08-625

error_name:
Seat Option Multiplier Failure

strategy:
SEQUENCE_REPLAY

confirmation_strategy:
누적 상태 + 가격 계산 DOM

precondition:
공간 기본 요금이 10,000원(또는 50,000원)이며, VIP 좌석 옵션 단가가 1인당 10,000원이다.

trigger:
1. 인원 수를 3명으로 선택
2. VIP 좌석 옵션(+10,000원 / 1인) 체크박스 선택
3. [일정 저장] 클릭 후 2단계 금액 상세 화면 진입

normal_behavior:
VIP 옵션 금액 = 10,000원 × 3명 = 30,000원
최종 금액 = 기본 요금 10,000원 + 30,000원 = 40,000원 (또는 기본 50,000원 + 30,000원 = 80,000원)

actual_error_behavior:
옵션 금액 계산 로직에서 인원 수 multiplier가 누락되어 1인분 가격인 10,000원만 추가된다.
최종 금액 = 기본 요금 10,000원 + 10,000원 = 20,000원 (기본 50,000원일 경우 60,000원)

required_evidence:
- DOM 이용 인원: 3명
- DOM VIP 좌석: +10,000원 / 1인
- DOM 옵션 금액: 10,000원
- DOM 최종 금액: 20,000원 (정상 대비 20,000원 과소 계산)

verification_method:
인원 수 3명 설정 → VIP 옵션 토글 → 2단계 요금 내역 DOM에서 '옵션 금액' 및 '최종 금액' 확인
```

---

## 4. BUG 4 — Partial Cancel Calculation Error

```text
bug_id: C-08-434

error_name:
Partial Cancel Calculation Error

strategy:
SEQUENCE_REPLAY

confirmation_strategy:
다중 예약 상태 + 부분 취소 + 환불 계산 DOM

precondition:
다중 공간 예약(#9001)에 Room A(Aurora Meeting Room, 50,000원)와 Room B(Harbor Room, 70,000원)가 포함되어 결제 완료(총 120,000원) 상태로 등록되어 있다.

trigger:
1. [내 예약] 탭 진입
2. 다중 공간 예약 카드(#9001) 확인
3. [Aurora Meeting Room 부분 취소] 버튼 클릭
4. 환불 예상 금액 확인 모달 관찰

normal_behavior:
Room A 금액(50,000원)에서 위약금 10%(5,000원)를 차감한 45,000원이 환불 예상 금액으로 산출되어야 한다.

actual_error_behavior:
전체 취소 시의 예외 로직 또는 계산 누락으로 인해 부분 취소 시 환불 예상 금액이 "0원"으로 산출된다.

required_evidence:
- DOM 취소 대상: Aurora Meeting Room
- DOM 결제 금액: 50,000원
- DOM 위약금: 5,000원
- DOM 환불 예상 금액: 0원

verification_method:
[내 예약] → #9001 다중 예약의 Room A 부분 취소 클릭 → 환불 모달의 '환불 예상 금액: 0원' 텍스트 확인
```

---

## 5. BUG 5 — Cancel Persistence Bug

```text
bug_id: C-08-1971

error_name:
Cancel Persistence Bug

strategy:
STATE_REVISIT

confirmation_strategy:
Mutation + Navigation Away + Revisit + State Comparison

precondition:
[내 예약] 목록에 '예약 확정' 상태인 예약(#1001)이 존재한다.

trigger:
1. [내 예약]에서 #1001 예약의 [예약 취소] 버튼 클릭
2. UI 상에서 뱃지가 '취소'로 변경된 것을 확인
3. 상단 네비게이션에서 [이번 주 일정] 또는 [공간 둘러보기] 탭으로 이동
4. 다시 [내 예약] 탭으로 재방문

normal_behavior:
취소 처리된 예약은 Backend DB 및 재조회 목록에서도 '취소' 상태로 유지되어야 한다.

actual_error_behavior:
취소 직후에는 React UI 상태 상 '취소'로 표시되지만, 다른 라우트로 이동 후 재방문하여 GET /api/reservations를 호출하면 백엔드 목록 조회 필터 오류로 인해 상태가 다시 '예약 확정' 뱃지로 부활한다.

required_evidence:
- Mutation 직후 DOM: '취소' 뱃지
- Route 전환 후 Revisit DOM: '예약 확정' 뱃지로 재표시됨

verification_method:
[내 예약] → #1001 [예약 취소] 클릭(취소 뱃지 확인) → [공간 둘러보기] 이동 → [내 예약] 재방문 → #1001 카드가 '예약 확정'으로 복원된 상태 확인
```

---

## 6. Deterministic Reset API

- **Endpoint**: `POST http://localhost:5007/api/test/reset`
- **Action**: 모든 예약, 환불, 슬롯 데이터를 초기 Seed 상태로 100% 원복.
