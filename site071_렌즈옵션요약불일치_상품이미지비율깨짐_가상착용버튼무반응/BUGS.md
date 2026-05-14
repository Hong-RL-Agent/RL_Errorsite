# Intentional Frontend GUI Bugs - site071

This document details the intentional GUI bugs implemented in `site071` for PPO training data.

---

### Bug 01: 렌즈 옵션 요약 불일치
- **Bug ID:** `site071-bug01`
- **CSV Error Name:** 렌즈 옵션 요약 불일치
- **Type:** `lens-option-summary-mismatch`
- **Location:** Right sticky cart summary panel -> Lens Option section.
- **Related File:** `public/app.js` (inside `renderCartSummary` function)
- **Data Bug ID Selector:** `[data-bug-id="site071-bug01"]`
- **User Symptom:** 사용자가 상품 상세 모달에서 "블루라이트 차단 렌즈" 등 다른 렌즈 옵션을 선택하고 "Add to Cart"를 눌러도, 우측 요약 패널에는 계속해서 초기값인 "Basic Clear"가 표시됨.
- **Technical Cause:** `renderCartSummary` 함수에서 `selectedLensNameEl`의 텍스트를 한 번만 초기화하고, 이후 `cart.lens`가 변경되어도 해당 DOM 요소의 텍스트를 업데이트하지 않도록 로직이 작성됨.
- **Expected Behavior (PPO Agent):** 사용자가 선택한 렌즈 옵션 명칭과 가격이 요약 패널에 실시간으로 반영되는지 확인해야 함.

---

### Bug 02: 상품 이미지 비율 깨짐
- **Bug ID:** `site071-bug02`
- **CSV Error Name:** 상품 이미지 비율 깨짐
- **Type:** `glasses-image-ratio-break`
- **Location:** Product Grid -> Product ID: G005 ("Bold Horizon").
- **Related File:** `public/styles.css`
- **Data Bug ID Selector:** `[data-bug-id="site071-bug02"]`
- **User Symptom:** "Bold Horizon" 상품의 이미지가 정비율로 표시되지 않고, 카드 영역에 꽉 차도록 가로로 길게 찌그러져(stretched) 보임.
- **Technical Cause:** 특정 상품 카드(`.bug-ratio`) 내의 이미지에 `object-fit: fill` 속성을 강제로 적용하여 고정된 컨테이너 비율에 맞춰 이미지가 왜곡됨.
- **Expected Behavior (PPO Agent):** 안경과 같은 제품 이미지는 `object-fit: contain` 또는 `object-fit: cover`를 사용하여 원본 비율을 유지해야 함.

---

### Bug 03: 가상 착용 버튼 무반응
- **Bug ID:** `site071-bug03`
- **CSV Error Name:** 가상 착용 버튼 무반응
- **Type:** `try-on-button-no-response`
- **Location:** Product Grid -> Product ID: G003 ("Urban Edge") -> "Try-on" Button.
- **Related File:** `public/app.js` (inside `renderProducts` loop)
- **Data Bug ID Selector:** `[data-bug-id="site071-bug03"]`
- **User Symptom:** "Urban Edge" 선글라스의 "Try-on" 버튼을 클릭해도 가상 착용 모달이 열리지 않고 아무런 반응이 없음. (다른 상품의 버튼은 정상 작동)
- **Technical Cause:** `renderProducts` 함수에서 `G003` 아이디를 가진 버튼에 대해서만 `click` 이벤트 리스너를 등록하지 않도록 조건부로 누락함.
- **Expected Behavior (PPO Agent):** 모든 활성화된 버튼은 클릭 시 정의된 액션(모달 열기 등)을 수행해야 함.
