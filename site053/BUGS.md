# BUGS.md — site053 (NearBuy)

This document contains the exact 5 intentional errors present in site053 for PPO agent evaluation.

---

### Bug 1: SEC-441
* **Bug ID**: SEC-441
* **Type**: Leading Zero Price Normalization Error
* **Category**: Input Handling
* **Family**: numeric-normalization
* **Severity**: medium
* **Endpoint**: `/api/products`
* **Method**: POST
* **Condition**: 상품 등록 시 가격 입력란에 선행 0이 포함된 숫자(예: `050000`)를 입력하여 등록할 때
* **File**: `src/pages/Sell.jsx`, `server.js`
* **Location**: `handlePriceChange` / `POST /api/products`
* **Selector**: `input[name="price"]`, `.price-display`
* **Symptom**: 화면에는 사용자가 의도한 금액(50,000원)으로 표시되지만, 서버 저장 및 등록된 상품 상세에서는 5,000원으로 10배 왜곡되어 저장됨
* **Expected Behavior**: 입력된 문자열의 선행 0은 올바르게 파싱되어 화면 표시값과 서버 저장값이 동일하게 50,000원으로 정규화되어야 함
* **PPO Expected Behavior**: 판매하기 -> 선행 0 가격 입력 -> 등록 -> 등록된 상품 상세 가격과 입력 가격 비교
* **Status**: Open
* **Example**: 입력: `050000` -> 화면: `50,000원` -> 실제 저장값: `5,000원`
* **Cause**: 문자열 변환 및 정규화 시 선행 0에 대해 자릿수 시프트/나눗셈 오류가 발생함

---

### Bug 2: SEC-442
* **Bug ID**: SEC-442
* **Type**: Multiline Description Newline Loss
* **Category**: Text Rendering
* **Family**: newline-preservation
* **Severity**: low
* **Endpoint**: `/api/products`, `/api/products/:id`
* **Method**: POST / GET
* **Condition**: 판매 상품 설명에 여러 줄의 문장(줄바꿈 `\n`)을 입력하여 등록한 후 상품 상세 화면을 조회할 때
* **File**: `src/pages/Sell.jsx`, `src/components/ProductDetail.jsx`, `server.js`
* **Location**: `POST /api/products` / `.product-description`
* **Selector**: `textarea[name="description"]`, `.detail-description-text`
* **Symptom**: 판매자가 작성한 줄바꿈과 단락 구분이 상세 페이지에서 모두 일반 공백으로 뭉개져 한 줄로 출력됨
* **Expected Behavior**: textarea에서 입력한 개행 문자(`\n`)가 보존되어 상세 화면에서도 단락 및 줄바꿈이 정상 렌더링되어야 함
* **PPO Expected Behavior**: 판매하기 -> 줄바꿈 포함 설명 작성 -> 등록 -> 상품 상세 페이지에서 줄바꿈 보존 여부 검증
* **Status**: Open
* **Example**: 입력: `사용감 없습니다.\n풀박스입니다.` -> 상세 화면: `사용감 없습니다. 풀박스입니다.`
* **Cause**: 백엔드 저장 또는 프론트엔드 렌더링 시 newline 정규식이 공백으로 치환됨

---

### Bug 3: SEC-443
* **Bug ID**: SEC-443
* **Type**: Image Deletion Preview Index Desync
* **Category**: Media UI
* **Family**: array-index-sync
* **Severity**: medium
* **Endpoint**: `/api/products`
* **Method**: POST
* **Condition**: 상품 등록 화면에서 사진 3장 이상 추가 후 중간 사진을 삭제하고 남은 사진을 대표 사진으로 선택할 때
* **File**: `src/pages/Sell.jsx`, `server.js`
* **Location**: `handleRemoveImage` / `selectedCoverIndex`
* **Selector**: `.image-delete-btn`, `.image-thumb-preview`
* **Symptom**: 중간 이미지를 삭제한 후 화면에서 특정 썸네일을 클릭하여 대표 사진으로 선택했으나, 내부 인덱스가 동기화되지 않아 엉뚱한 이미지가 대표 사진으로 등록됨
* **Expected Behavior**: 배열 요소 삭제 시 선택된 인덱스가 재조정되어 클릭한 이미지가 정확히 대표 사진으로 지정되어야 함
* **PPO Expected Behavior**: 판매하기 -> 이미지 A, B, C 추가 -> B 삭제 -> C 클릭 -> 대표 이미지 불일치 확인
* **Status**: Open
* **Example**: [A, B, C] 중 B 삭제 후 [A, C] 상태에서 C를 클릭했으나 내부 인덱스 1이 아닌 잘못된 인덱스가 지정됨
* **Cause**: 이미지 배열 `splice` 시 `selectedCoverIndex` 상태를 재계산하지 않고 이전 인덱스를 유지함

---

### Bug 4: SEC-444
* **Bug ID**: SEC-444
* **Type**: Report Reason Radio Value Mismatch
* **Category**: Form State
* **Family**: radio-value-mismatch
* **Severity**: medium
* **Endpoint**: `/api/reports`
* **Method**: POST
* **Condition**: 상품 상세에서 '신고하기' 모달을 열고 특정 사유(예: "사기 의심")를 선택하여 제출할 때
* **File**: `src/components/ReportModal.jsx`, `server.js`
* **Location**: `POST /api/reports` / `handleSubmitReport`
* **Selector**: `input[type="radio"][name="reportReason"]`, `.report-submit-btn`
* **Symptom**: 사용자는 라디오에서 "사기 의심"을 선택했으나 서버에는 "부적절한 내용" 등 다른 사유로 매핑되어 저장됨
* **Expected Behavior**: 라디오 버튼에서 선택한 사유 텍스트/키가 서버에 그대로 1:1 전달 및 저장되어야 함
* **PPO Expected Behavior**: 상품 상세 -> 신고하기 -> "사기 의심" 선택 -> 신고 제출 -> 서버 응답/저장 사유 확인
* **Status**: Open
* **Example**: 라디오 선택: `사기 의심` -> 전송/저장: `부적절한 내용`
* **Cause**: 폼 전송 핸들러 및 서버 매핑 로직에서 라디오 인덱스 오프셋 시프트가 발생함

---

### Bug 5: SEC-445
* **Bug ID**: SEC-445
* **Type**: Browser Navigation Form Preview Desync
* **Category**: Navigation State
* **Family**: form-preview-desync
* **Severity**: medium
* **Endpoint**: `/api/products`
* **Method**: POST
* **Condition**: 판매글 작성 중 미리보기 화면으로 이동한 뒤 브라우저 뒤로가기(또는 작성화면 복귀)를 눌렀을 때
* **File**: `src/pages/Sell.jsx`, `server.js`
* **Location**: `handleNavigateBack` / `previewSyncState`
* **Selector**: `.preview-back-btn`, `.sell-preview-card`
* **Symptom**: 브라우저 뒤로가기 후 작성 화면의 입력 필드 값(예: 가격, 설명)과 다시 열어본 미리보기 화면의 데이터가 서로 다른 상태를 참조하여 불일치함
* **Expected Behavior**: 뒤로가기 후에도 단일 form draft 상태가 유지되어 작성 폼과 미리보기가 항상 동일한 데이터를 반영해야 함
* **PPO Expected Behavior**: 판매하기 -> 정보 입력 -> 미리보기 -> 뒤로가기 -> 수정 -> 다시 미리보기 데이터 비교
* **Status**: Open
* **Example**: 작성 폼 가격 300,000원 -> 미리보기 이동 후 뒤로가기 -> 작성 폼 가격 30,000원 (이전 상태로 롤백)
* **Cause**: 네비게이션 시 form draft와 preview state가 서로 다른 스토리지/state를 동기화 없이 독립 참조함
