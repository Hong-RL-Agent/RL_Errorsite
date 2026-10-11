# BUGS.md — B-09 RoamDrive 의도적 오류 명세 (Unseen Test)

공통 사항
- 오류 5개 모두 **Frontend 에서만** 발생한다. Backend(SQLite) 로직은 정상이며 데이터는 손상되지 않는다.
- 구성: SEQUENCE_REPLAY 2(ERR01·02) / ACTION_REPLAY 2(ERR03·05) / STATE_REVISIT 1(ERR04). DQN_학습대상: ERR01·02·03·05 = **O**, ERR04 = **조건부**.
- 화면에는 오류 ID/원인을 표시하지 않는다. `data-bug-id` 속성으로만 식별한다.
- **기준일(오늘)은 서버 고정값 `2026-10-14`** (`GET /api/health` 의 `today`). 검색 기본 일정은 오늘+6일 10:00 ~ 오늘+9일 10:00(2026-10-20 10:00 → 10-23 10:00).
- 기본 고객: 고객 ID 1 ("데모 고객"). 고정 예약(고객 1): 1·2·3·11 예약확정 / 6 예약대기 / 7 픽업완료 / 8 반납완료 / 9·10 대여종료 / 4·5·12 예약취소.
- 증거 수집: `window.__roamActions`(행동 로그), `window.__roamState`(예약 단계 상태: protectionPlanId, suggestedPlanId, addOns, criteria …), Network 탭, DOM(`[data-bug-id]`, `[data-trip-id]`, `[data-line]`, `[data-stage]`).
- Reset: `POST http://localhost:9723/api/test/reset` 또는 콘솔 `await window.__roamReset()` (프론트 상태·캐시·sessionStorage 함께 초기화). 모든 시나리오는 Reset 직후 시작한다.

---

## B09-ERR01 — 미선택 보험 옵션 자동 추가

| 항목 | 내용 |
|---|---|
| bug_id | B09-ERR01 |
| CSV No / 오류명 | 621 / 보험/옵션 강제 추가 |
| 확인전략 | SEQUENCE_REPLAY |
| DQN_학습대상 | O |
| 관련 파일 | `frontend/src/screens/ProtectionScreen.jsx` (`next`), `frontend/src/flows/BookingFlow.jsx`, `frontend/src/screens/ReviewScreen.jsx` |
| data-bug-id selector | `[data-bug-id="B09-ERR01"]` (보험 선택 패널 `section.panel`) |
| precondition | Reset 직후, `/` 검색 화면. 보험 없이도 예약 가능한 차량(결과에서 "이 차량으로 예약"이 활성인 아무 차량) |

단계별 사용자 행동
1. 픽업 장소 입력란에 `서울` 입력 → 목록에서 `서울역점` 선택 (반납은 "픽업 장소와 동일").
2. 날짜·시간은 기본값(10/20 10:00 → 10/23 10:00) 사용 → "차량 조회".
3. 결과의 임의 차량에서 "이 차량으로 예약" → `/book/protection`.
4. 라디오에서 **추가 보험 없음** 선택(기본 선택 상태) → 우측 금액 요약에 보험 줄 없음을 확인 → "다음 단계".
5. 부가 옵션 → 아무것도 선택하지 않고 "다음 단계" → 운전자 정보(자동 채움) → "예약 확인으로".
6. 예약 확인 화면의 최종 금액 패널 확인.

- 정상 기대 동작: 추가 보험 줄이 없고 총액이 보험 선택 화면의 금액과 같다. `POST /api/quotes/calculate` 요청에 `protectionPlanId: 0`.
- 실제 오류 동작: 확인 패널에 `차량손해 면책 플러스` 줄이 추가되고 총액이 (12,000원 × 일수)만큼 증가. 요청 본문이 `protectionPlanId: 2`.
- 코드상 원인: `choice || s.suggestedPlanId` — "추가 보험 없음"의 값 `0` 이 falsy 라서 추천 보험 ID 로 대체되어 다음 단계 상태에 저장됨. Backend 는 전달받은 옵션만 계산한다.
- 필요한 Evidence: ActionLog + UI + State + Network.
- Confirmation Oracle: 4단계의 실제 선택(`protection` 라디오 value=0, `__roamActions`의 `protection_next choice=0`)과 5~6단계의 `window.__roamState.protectionPlanId`(=2) / 예약 확인 요청의 옵션 목록·금액 비교.
- Reset 및 반복: Reset 후 동일 순서로 항상 재현. 대조군: 다른 보험(예: 완전 자차 커버)을 선택하면 정상 전달.
- DQN 기대 행동: 보험 선택 단계의 선택값을 기억한 뒤 최종 요약의 보험/금액과 대조하여 불일치를 확인.

---

## B09-ERR02 — 차량 픽업 전 잘못된 상태 전이 표시

| 항목 | 내용 |
|---|---|
| bug_id | B09-ERR02 |
| CSV No / 오류명 | 424 / 워크플로우 제어 오류 / 부적절한 상태 전이 |
| 확인전략 | SEQUENCE_REPLAY |
| DQN_학습대상 | O |
| 관련 파일 | `frontend/src/screens/TripDetailScreen.jsx` (`stageIndex`), `frontend/src/screens/TripEditScreen.jsx`, `frontend/src/flows/routeMemory.js` |
| data-bug-id selector | `[data-bug-id="B09-ERR02"]` (대여 진행 타임라인 `ol.progress`) |
| precondition | 예약확정·미픽업 예약 — 예약 ID 1 (`RD-000001`) |

단계별 사용자 행동
1. 상단 "내 예약" → `RD-000001` 카드 클릭 → 예약 상세.
2. 대여 진행 타임라인 확인: `예약 확정`이 현재 단계(`[data-stage="confirmed"]` 가 now), 픽업·반납·종료는 미완료.
3. "예약 정보 수정" → 운전자 연락처 등을 변경 → "수정 완료" (정상 토스트 표시).
4. 자동으로 예약 상세로 복귀 → 타임라인 확인.

- 정상 기대 동작: 수정 전과 동일하게 `예약 확정` 단계에 머물고 반납 단계는 미완료.
- 실제 오류 동작: `예약 확정`·`차량 픽업`·`차량 반납` 단계가 모두 ✓ 완료로 표시되고 `대여 종료`가 현재 단계. 예약 상태 배지와 DB 는 계속 `예약확정`(`GET /api/itineraries/1`). 새로고침하면 정상 표시.
- 코드상 원인: 수정 화면에서 돌아온 직후(`afterEdit`) 단계 인덱스를 `STAGES.indexOf(status) + 2` 로 계산.
- 서버 방어: `POST /api/itineraries/1/return` 은 409 `INVALID_TRANSITION` (픽업 전 반납 차단).
- 필요한 Evidence: ActionLog + UI + State + Network.
- Confirmation Oracle: 수정 전/후 타임라인 완료 단계 수 비교 + `GET /api/itineraries/1` 의 `status:"confirmed"` 와 UI 의 `[data-stage="returned"].done` 불일치.
- Reset 및 반복: Reset 후 예약 1 로 동일 재현. 편집 없이 방문하면 정상.
- DQN 기대 행동: 수정 완료 후 상세 복귀 시 타임라인/상태 배지/Network 응답을 교차 확인.

---

## B09-ERR03 — 예약 변경 완료 메시지 누락

| 항목 | 내용 |
|---|---|
| bug_id | B09-ERR03 |
| CSV No / 오류명 | 1648 / 성공/실패 피드백 부재 |
| 확인전략 | ACTION_REPLAY |
| DQN_학습대상 | O |
| 관련 파일 | `frontend/src/screens/TripDetailScreen.jsx` (`saveReturnTime`) |
| data-bug-id selector | `[data-bug-id="B09-ERR03"]` ("변경 저장" 버튼) |
| precondition | 일정 변경 가능한 예약 — 예약 ID 2 (`RD-000002`, 예약확정, 반납 10/28 10:00) |

- Trigger: 예약 상세 → "반납 일정 변경" 패널에서 반납 예정 일시를 `2026-10-27 18:00` 으로 수정 → "변경 저장".
- 정상 기대 동작: `PATCH /api/itineraries/2` 성공 후 반납 시간이 갱신되고 성공 토스트 표시.
- 실제 오류 동작: PATCH 는 200 이고 `예약 정보`의 반납 예정(`[data-field="end-at"]`)도 새 시간으로 바뀌지만 토스트/안내 메시지가 전혀 나타나지 않음. (취소·픽업·반납·예약 정보 수정 등 다른 작업은 토스트 표시)
- 코드상 원인: `saveReturnTime` 성공 분기에서 `toast()` 호출이 없음.
- 필요한 Evidence: ActionLog(`return_time_saved`) + UI + DOM(`.toast` 부재) + Network(PATCH 200).
- Confirmation Oracle: 저장 직후 3.6초 내 `[role=status].toast` 가 없고 PATCH 200 + 화면 값 변경이 있음.
- Reset 및 반복: Reset 후 같은 예약 2로 반복(단축 변경은 항상 가능). 대조군: 같은 화면의 "예약 취소"/"픽업 완료 처리"는 토스트 표시.
- DQN 기대 행동: 저장 클릭 후 피드백 요소의 존재 여부를 확인.

---

## B09-ERR04 — 취소한 예약이 뒤로가기 후 다시 표시됨

| 항목 | 내용 |
|---|---|
| bug_id | B09-ERR04 |
| CSV No / 오류명 | 1610 / 백포워드 캐시 상태 박제 |
| 확인전략 | STATE_REVISIT |
| DQN_학습대상 | 조건부 |
| 관련 파일 | `frontend/src/screens/TripsScreen.jsx`, `frontend/src/flows/routeMemory.js`, `frontend/src/screens/TripDetailScreen.jsx` |
| data-bug-id selector | `[data-bug-id="B09-ERR04"]` (예약 목록 타임라인 `ol.timeline`) |
| precondition | 예약확정 예약 — 예약 ID 3 (`RD-000003`) |

단계별 사용자 행동
1. "내 예약" 목록에서 `RD-000003` 이 `예약확정` 으로 표시됨을 확인 (저장 전 상태).
2. 카드 클릭 → 예약 상세.
3. "예약 취소" → 확인 모달의 "예약 취소하기" → 토스트 후 배지가 `예약취소` 로 바뀜 (`POST /api/itineraries/3/cancel` 200).
4. 상단 "차량 찾기" 등 다른 화면으로 이동.
5. 브라우저 뒤로가기를 두 번(차량 찾기 → 예약 상세 → 예약 목록) 실행하여 목록으로 복귀.

- 정상 기대 동작: 목록의 `RD-000003` 이 `예약취소`.
- 실제 오류 동작: 복귀한 목록에서 `RD-000003` 이 여전히 `예약확정`. 복귀 시 `/api/itineraries` 요청이 발생하지 않음. `GET /api/itineraries/3` 은 `cancelled`. 새로고침하면 `예약취소`.
- 코드상 원인: 목록 화면이 `useNavigationType()==='POP'` 이면 직전 목록 스냅샷(`routeMemory`)을 서버 조회 없이 재사용. `pageshow(persisted)` 복원도 동일. BFCache 사용 여부와 무관.
- 필요한 Evidence: ActionLog(`trips_restored`) + UI + Network + State.
- Confirmation Oracle: 복귀 후 `[data-trip-id="3"] [data-status]` 값(confirmed) vs 취소 API/단건 조회 결과(cancelled).
- Reset 및 반복: Reset 후 동일 순서로 항상 재현. 새로 "내 예약" 링크를 눌러 들어가면(PUSH) 정상.
- DQN 기대 행동: 상태 변경 → 화면 이탈 → 뒤로가기 재방문 후 이전 상태와 서버 상태를 비교.

---

## B09-ERR05 — 예약 내역 삭제 시 확인 과정 생략

| 항목 | 내용 |
|---|---|
| bug_id | B09-ERR05 |
| CSV No / 오류명 | 2097 / 행동 확인 없음 |
| 확인전략 | ACTION_REPLAY |
| DQN_학습대상 | O |
| 관련 파일 | `frontend/src/screens/ArchiveScreen.jsx` (`onClean`) |
| data-bug-id selector | `[data-bug-id="B09-ERR05"]` ("취소 내역" 탭의 "내역 정리" 버튼) |
| precondition | 취소된 예약의 내역 관리 — 예약 ID 4·5·12 |

- Trigger: "내 예약" → 탭 "내역 관리" → "취소 내역" 탭에서 `RD-000004` 의 **내역 정리** 클릭.
- 정상 기대 동작: 삭제 확인 모달이 열리고 확정해야 `DELETE /api/itineraries/4/history` 호출.
- 실제 오류 동작: 모달 없이 클릭 즉시 DELETE 가 호출되고 항목이 사라지며 "예약 내역을 정리했어요" 토스트만 표시.
- 코드상 원인: `onClean` 이 `cancelled` 탭에서는 확인 모달을 거치지 않고 `remove()` 를 직접 호출.
- 서버 정책: 취소·대여종료 예약만 삭제 가능(그 외 409). 차량 점유/다른 예약은 영향 없음.
- 대조군: "완료 내역" 탭의 "내역 정리"와 예약 상세의 "내역 삭제"는 확인 모달 후 삭제.
- 필요한 Evidence: ActionLog(`history_cleared`) + UI(모달 부재) + Network(DELETE 즉시) + State.
- Confirmation Oracle: 클릭 직후 `.dialog` 없이 DELETE 200 및 목록 항목 제거.
- Reset 및 반복: Reset 으로 예약 4·5·12 복원 → 반복 재현.
- DQN 기대 행동: 파괴적 행동 클릭 시 확인 단계 유무를 관찰.
