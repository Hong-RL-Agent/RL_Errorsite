# BookNest 의도적 기능 오류 명세서 (BUGS.md)

본 문서는 BookNest (D-04) 도서관 장서 및 대출 관리 웹사이트에 의도적으로 삽입된 5가지 기능 오류에 대한 명세서입니다.  
모든 오류의 검증 확인전략은 **ACTION_REPLAY**이며, 단일 사용자 행동(Trigger Action) 실행 전후의 UI, DOM, Network(API 응답 페이로드), State(SQLite 데이터베이스 상태)를 대조하여 결정적으로 재현 및 검증할 수 있습니다.

---

## 1. BUG-D04-01: 특정 도서 대출 시 대출 가능 수량 미감소 오류

- **bug_id**: `BUG-D04-01`
- **오류명**: 특정 도서(Clean Code 클린 코드) 대출 시 대출 성공 알림은 표시되나 대출 가능 재고 수량이 감소하지 않는 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 도서**: 도서 ID `3` (`Clean Code 클린 코드`, 초기 대출 가능 수량: `3권` / 총 재고: `3권`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 도서 ID `3`의 `available_copies`가 `3`이어야 함.
- **실행 행동 (Trigger)**:
  1. 도서 장서 목록에서 `Clean Code 클린 코드` 카드의 [대출 신청] 버튼 클릭.
  2. 대출 신청 모달에서 회원(예: `김민준`) 선택 후 [대출 확인 및 접수] 1회 클릭 (`POST /api/loans`).
- **기대 결과 (Expected Behavior)**:
  - 대출 성공 알림과 함께 `Clean Code 클린 코드` 카드의 대출 가능 수량이 `3권`에서 `2권`(`2/3`)으로 1 감소해야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 대출 내역(LN)은 정상 생성되고 성공 알림이 표시되지만, 백엔드에서 `book_id === 3`일 때 도서 재고 수량 차감 쿼리(`UPDATE books SET available_copies = available_copies - 1`)를 건너뜀.
  - 카드의 대출 가능 수량이 여전히 `3권`(`3/3`)으로 그대로 유지됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 대출 완료 후 카드의 `대출 가능 (3/3)` 배지 상태.
  - **Network**: `POST /api/loans` 호출 후 `GET /api/books/3` 응답의 `available_copies` 값이 여전히 `3`.
  - **State**: SQLite `SELECT available_copies FROM books WHERE id = 3` 결과가 `3`.
- **재현 확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 실행.
  2. `Clean Code 클린 코드` 도서의 [대출 신청] -> 이용자 선택 -> [대출 확인 및 접수] 클릭.
  3. 성공 알림 확인 후 도서 목록에서 해당 카드의 대출 가능 수량이 `2권`이 아닌 `3권`으로 유지되는지 확인.
  4. Network 탭에서 `GET /api/books` 응답을 확인하여 `id: 3`의 `available_copies`가 `3`인지 대조 검증.

---

## 2. BUG-D04-02: 특정 도서 반납 버튼 클릭 시 대출 상태 잔류 오류

- **bug_id**: `BUG-D04-02`
- **오류명**: 특정 도서(총, 균, 쇠, 대출 ID: 5) 반납 처리 시 성공 알림 후에도 대출 상태('BORROWED') 유지 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 대출 내역**: 대출 ID `5` (`총, 균, 쇠`, 대출자: 윤시우, 초기 상태: `BORROWED`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 대출 ID `5`의 상태가 `BORROWED` (대출 중)이어야 함.
- **실행 행동 (Trigger)**:
  1. 상단 탭에서 [대출 및 반납 관리] 탭 선택.
  2. 대출 번호 `LN-5` (`총, 균, 쇠`, 윤시우) 행 우측의 [도서 반납] 버튼 1회 클릭 (`PATCH /api/loans/5/return`).
- **기대 결과 (Expected Behavior)**:
  - 상태 배지가 `반납 완료`로 변경되고, 반납일자가 기록되며, [도서 반납] 버튼이 비활성화되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - "도서 반납 처리가 완료되었습니다." 성공 알림이 노출되지만, 백엔드에서 `loanId === 5`일 때 실제 DB status 업데이트를 생략함.
  - 상태 배지가 여전히 `대출 중`으로 남아있고 [도서 반납] 버튼이 계속 표시됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 반납 버튼 클릭 후에도 `LN-5` 행의 상태 배지가 주황색 `대출 중`으로 유지됨.
  - **Network**: `PATCH /api/loans/5/return` 응답 객체의 `data.status`가 `'BORROWED'`.
  - **State**: SQLite `SELECT status FROM loans WHERE id = 5` 결과가 `'BORROWED'`.
- **재현 확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 실행.
  2. [대출 및 반납 관리] 탭으로 이동.
  3. `LN-5` (`총, 균, 쇠`)의 [도서 반납] 버튼 클릭.
  4. 성공 알림 확인 후 해당 행의 상태 배지가 `대출 중`으로 그대로 유지되는지 확인.

---

## 3. BUG-D04-03: 특정 도서 제목 수정 시 타 도서 제목 변경 오류

- **bug_id**: `BUG-D04-03`
- **오류명**: 특정 도서(데미안, ID: 12) 제목 수정 시 다른 도서(어린 왕자, ID: 11)의 제목이 변경되는 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 도서**:
  - 사용자 수정 대상: 도서 ID `12` (`데미안`, 헤르만 헤세)
  - 실제 변경 대상: 도서 ID `11` (`어린 왕자`, 앙투안 드 생텍쥐페리)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - ID 12의 제목은 `데미안`, ID 11의 제목은 `어린 왕자`이어야 함.
- **실행 행동 (Trigger)**:
  1. `데미안` (ID: 12) 카드의 연필([수정]) 버튼 클릭.
  2. 도서 제목을 `데미안 (리마스터 특별판)`으로 변경.
  3. 하단 [수정사항 저장] 1회 클릭 (`PATCH /api/books/12`).
- **기대 결과 (Expected Behavior)**:
  - `데미안`의 제목이 `데미안 (리마스터 특별판)`으로 변경되고, `어린 왕자`는 그대로 유지되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - `데미안` 카드의 제목은 변경되지 않고 그대로 `데미안`으로 유지됨.
  - 대신 바로 앞의 도서인 `어린 왕자` (ID: 11) 카드의 제목이 `데미안 (리마스터 특별판)`으로 엉뚱하게 변경됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 수정 저장 후 ID 12 카드는 여전히 `데미안`이고, ID 11 카드가 `데미안 (리마스터 특별판)`으로 바뀐 화면.
  - **Network**: `PATCH /api/books/12` 요청 후 `GET /api/books` 조회 시 ID 11의 `title` 필드가 변경된 JSON 데이터.
  - **State**: SQLite `SELECT id, title FROM books WHERE id IN (11, 12)`에서 ID 11의 title만 변경됨.
- **재현 확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 실행.
  2. `데미안` 카드의 수정 버튼 클릭 -> 제목을 `데미안 (리마스터 특별판)`으로 변경 후 저장.
  3. 목록에서 `데미안` 카드의 제목 확인 (여전히 `데미안`).
  4. 바로 앞의 `어린 왕자` 카드의 제목 확인 (`데미안 (리마스터 특별판)`으로 변경되어 있음).

---

## 4. BUG-D04-04: 특정 도서 삭제 시 성공 알림 후 목록 잔류 오류

- **bug_id**: `BUG-D04-04`
- **오류명**: 특정 도서(사피엔스, ID: 8) 삭제 시 성공 알림 후에도 목록 및 DB에 그대로 잔류하는 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 도서**: 도서 ID `8` (`사피엔스`, 유발 하라리)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 도서 목록에 ID `8` (`사피엔스`)가 존재해야 함.
- **실행 행동 (Trigger)**:
  - `사피엔스` (ID: 8) 카드의 우측 하단 휴지통([삭제]) 버튼 1회 클릭 (`DELETE /api/books/8`).
- **기대 결과 (Expected Behavior)**:
  - "도서가 성공적으로 삭제되었습니다." 알림과 함께 목록 및 DB에서 `사피엔스`가 완전히 제거되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 삭제 성공 알림이 노출되고 200 OK를 반환하지만, 백엔드에서 ID 8일 때 실제 DELETE 쿼리를 실행하지 않음.
  - 목록을 다시 조회하거나 새로고침했을 때 `사피엔스` 도서가 목록에 그대로 남아있음.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 삭제 버튼 클릭 후에도 서가 목록에 여전히 존재하는 `사피엔스` 카드.
  - **Network**: `DELETE /api/books/8` 200 OK 응답 후 `GET /api/books` 결과에 `id: 8`이 포함되어 있음.
  - **State**: SQLite `SELECT COUNT(*) FROM books WHERE id = 8` 결과가 `1`.
- **재현 확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 실행.
  2. `사피엔스` 카드의 휴지통([삭제]) 버튼 클릭.
  3. "삭제되었습니다" 알림 확인 후 카테고리를 변경했다가 다시 돌아오거나 새로고침.
  4. `사피엔스` 카드가 삭제되지 않고 그대로 유지되어 있는지 확인.

---

## 5. BUG-D04-05: 특정 도서 재고 수량 수정 시 값 왜곡 반영 오류

- **bug_id**: `BUG-D04-05`
- **오류명**: 특정 도서(객체지향의 사실과 오해, ID: 15) 재고 수량 수정 시 입력값과 다른 수량(2권)으로 왜곡 저장되는 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 도서**: 도서 ID `15` (`객체지향의 사실과 오해`, 초기 총 재고: 3권)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - ID 15의 총 재고는 `3권`이어야 함.
- **실행 행동 (Trigger)**:
  1. `객체지향의 사실과 오해` (ID: 15) 카드의 연필([수정]) 버튼 클릭.
  2. [총 소장 권수 (재고)] 입력창에 `5`를 입력.
  3. 하단 [수정사항 저장] 1회 클릭 (`PATCH /api/books/15`).
- **기대 결과 (Expected Behavior)**:
  - 저장 완료 후 도서 카드의 총 재고 권수가 입력한 `5권`으로 반영되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 백엔드 업데이트 로직에서 ID 15의 재고 수량을 입력값과 무관하게 강제로 `2`로 왜곡하여 저장함.
  - 카드의 재고 상태가 5권이 아닌 `대출 가능 (2/2)`로 표시됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 수정 모달에 입력한 수량 `5` vs 저장 후 카드의 `대출 가능 (2/2)`.
  - **Network**: 요청 페이로드 `{ total_copies: 5 }` vs 응답 페이로드 `{ data: { total_copies: 2 } }`.
  - **State**: SQLite `SELECT total_copies FROM books WHERE id = 15` 결과가 `2`.
- **재현 확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 실행.
  2. `객체지향의 사실과 오해` 카드의 수정 버튼 클릭 -> 총 소장 권수를 `5`로 입력 후 저장.
  3. 카드 화면 확인: 총 권수가 5권이 아닌 `2권`으로 왜곡되어 표시되는지 검증.
  4. Network 탭에서 `PATCH /api/books/15`의 응답 데이터 `total_copies`가 `2`인지 확인.
