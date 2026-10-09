# C-07 Bug Catalog & Training Specification

- **Site ID**: `C-07`
- **Site Name**: `Morrow (배송지 관리 서비스)`
- **Strategy**: `STATE_REVISIT`
- **Frontend**: React + Vite (`http://localhost:5179`)
- **Backend**: Express + SQLite (`http://localhost:5006`)
- **Reset API**: `POST http://localhost:5006/api/test/reset`

---

## 1. C-07-194 — Persistence Loss on Reload

### Bug Information
- **bug_id**: `C-07-194`
- **error_name**: `Persistence Loss on Reload (신규 배송지 새로고침 시 영속성 유실 오류)`
- **strategy**: `STATE_REVISIT`

### Precondition
- 배송지 관리 화면 (`/mypage/addresses`) 진입 상태.

### Trigger Sequence
1. [새 배송지 추가] 버튼 클릭하여 등록 폼 (`/mypage/addresses/new`) 이동
2. 신규 배송지 (예: 별칭 "학교", 주소 "경기도 수원시 팔달구 테스트로 50") 입력 후 [배송지 등록 완료] 클릭
3. 목록 화면으로 자동 복귀 후 새 배송지(ID: 103)가 목록에 존재하는 것 확인 (`data-address-id="103"`)
4. 브라우저 새로고침 (F5 Reload) 수행
5. 새로고침 후 배송지 목록 재관찰

### Normal Behavior
- 새로고침 후에도 `GET /api/addresses`를 통해 DB에 저장된 신규 배송지가 그대로 유지되어야 함.

### Actual Behavior (Intended Bug)
- `POST /api/addresses` API가 201 응답과 시뮬레이션 데이터를 반환하여 클라이언트 메모리/DOM에는 일시적으로 렌더링되지만, 실제 SQLite DB `addresses` 테이블에는 INSERT되지 않아 Reload 시 `GET /api/addresses` 조회 결과에서 새 배송지가 완전히 증발함.

### Required Evidence
- **Reload 전 DOM**: `data-address-id="103"` 존재.
- **Reload 후 DOM**: `data-address-id="103"` 미존재 (기존 집, 회사 2개만 노출).
- **Backend**: SQLite `addresses` 테이블에 ID 103 레코드가 존재하지 않음.

---

## 2. C-07-894 — Default Address Unset Revisit

### Bug Information
- **bug_id**: `C-07-894`
- **error_name**: `Default Address Unset Revisit (기본 배송지 설정 후 라우트 재방문 시 이전 상태 복구 오류)`
- **strategy**: `STATE_REVISIT`

### Precondition
- 초기 기본 배송지: `배송지 A (집, ID: 101)`.

### Trigger Sequence
1. 배송지 관리 화면 (`/mypage/addresses`)에서 `배송지 B (회사, ID: 102)`의 **[기본 배송지로 설정]** 클릭
2. 배송지 B에 `[기본 배송지]` 뱃지가 정상 부착된 것 확인
3. 상단 메뉴를 통해 **마이페이지 (`/mypage`)**로 이동
4. 다시 **배송지 관리 (`/mypage/addresses`)**로 재진입(Revisit)

### Normal Behavior
- 재방문 시에도 배송지 B(회사)가 기본 배송지 뱃지를 유지해야 함.

### Actual Behavior (Intended Bug)
- 현재 화면에서는 기본 배송지 변경이 성공한 것처럼 보이나, 라우트 이탈 후 재방문 시 백엔드 조회 로직의 캐시 룩업 버그로 인해 이전 기본 배송지(집, ID: 101)로 복구되어 렌더링됨.

### Required Evidence
- **재방문 전 DOM**: 배송지 B(회사)에 `[기본 배송지]` 뱃지 존재.
- **재방문 후 DOM**: 배송지 A(집)에 `[기본 배송지]` 뱃지가 다시 나타남.

---

## 3. C-07-1797 — Edit Revert on Revisit

### Bug Information
- **bug_id**: `C-07-1797`
- **error_name**: `Edit Revert on Revisit (배송지 수정 후 재방문 시 클라이언트 쿼리 캐시 구 데이터 복원)`
- **strategy**: `STATE_REVISIT`

### Precondition
- `배송지 A (집, ID: 101)` 상세 주소: "권선구 테스트로 10".

### Trigger Sequence
1. 배송지 A의 수정 아이콘 클릭 (`/mypage/addresses/101/edit`)
2. 상세 주소를 **"영통구 테스트로 99"**로 변경 후 [수정사항 저장] 클릭
3. 목록 화면에서 "영통구 테스트로 99"로 정상 반영된 것 확인
4. 다른 라우트(예: `/mypage` 또는 `/order`)로 이동
5. 다시 **배송지 관리 (`/mypage/addresses`)**로 재방문

### Normal Behavior
- 재방문 시에도 최신 DB 주소인 "영통구 테스트로 99"가 표시되어야 함.

### Actual Behavior (Intended Bug)
- 실제 SQLite DB에는 "영통구 테스트로 99"가 성공적으로 UPDATE되었으나, 클라이언트 쿼리 캐시(Client Query Cache)의 무효화(Invalidation) 누락으로 인해 재방문 시 메모리에 남아있던 이전 캐시 데이터("권선구 테스트로 10")가 우선 렌더링됨.

### Required Evidence
- **수정 직후 DOM**: `data-role="detail-address"` = "영통구 테스트로 99".
- **재방문 후 DOM**: `data-role="detail-address"` = "권선구 테스트로 10".
- **Backend / Network**: `GET /api/addresses/101` 직접 조회 시 DB는 "영통구 테스트로 99"임 (DB State ≠ Revisited DOM State).

---

## 4. C-07-005 — Cascade Delete Revisit

### Bug Information
- **bug_id**: `C-07-005`
- **error_name**: `Cascade Delete Revisit (배송지 삭제 후 주문서 진입 시 고아 데이터 잔존 및 404 오류)`
- **strategy**: `STATE_REVISIT`

### Trigger Sequence
1. 배송지 관리 화면 (`/mypage/addresses`)에서 `배송지 B (회사, ID: 102)`의 **[삭제]** 아이콘 클릭
2. 배송지 관리 목록에서 배송지 B가 정상 삭제되어 사라진 것 확인
3. 상단 메뉴를 통해 **주문서 (`/order`)** 화면으로 이동
4. 주문서 내 배송지 선택 목록 관찰 및 삭제된 `배송지 B (회사)` 클릭

### Normal Behavior
- 배송지가 삭제되면 주문서의 배송지 선택 옵션에서도 배송지 B가 노출되지 않아야 함.

### Actual Behavior (Intended Bug)
- `DELETE /api/addresses/102`로 실제 `addresses` 테이블에서는 삭제되었으나, 주문서의 배송지 선택 스냅샷 캐시에는 배송지 B가 고아 레코드로 잔존함. 사용자가 이를 클릭하면 실시간 검증 `GET /api/addresses/102`가 `404 Not Found`를 반환하며 "배송지 정보를 불러올 수 없습니다." 에러가 발생함.

### Required Evidence
- **배송지 관리 DOM**: 배송지 B(회사) 소멸.
- **주문서 DOM**: 배송지 B(회사)가 선택 옵션으로 잔존.
- **Network / DOM Alert**: 배송지 B 클릭 시 `GET /api/addresses/102` `404 Not Found` 수신 및 "배송지 정보를 불러올 수 없습니다." 경고 발생.

---

## 5. C-07-1609 — Multi-tab Stale Revisit / History Back-Forward

### Bug Information
- **bug_id**: `C-07-1609`
- **error_name**: `Multi-tab Stale Revisit (브라우저 Back/Forward 시 이전 DOM/History 상태 복원)`
- **strategy**: `STATE_REVISIT`

### Trigger Sequence
1. 배송지 A (ID: 101) 주소 수정 후 저장
2. 마이페이지 (`/mypage`)로 이동
3. 브라우저 뒤로 가기 (`history.back()`) 클릭
4. 브라우저 앞으로 가기 (`history.forward()`) 및 복원 화면 관찰

### Normal Behavior
- 브라우저 뒤로/앞으로 가기 시에도 최신 서버 주소가 렌더링되어야 함.

### Actual Behavior (Intended Bug)
- 브라우저 History 복원 과정에서 이전 DOM/State가 복원되어 최신 DB 주소가 아닌 수정 전 과거 주소가 표시됨.

### Required Evidence
- **DB State**: 최신 수정 주소 ("영통구 테스트로 99").
- **Back/Forward 후 DOM**: 수정 전 과거 주소 ("권선구 테스트로 10").
