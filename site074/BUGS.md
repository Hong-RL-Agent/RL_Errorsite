# Intentional Frontend GUI Bugs - site074

Detailed reports of the intentional bugs in `site074`.

---

### Bug 01: 보관함 개수 불일치
- **Bug ID:** `site074-bug01`
- **CSV Error Name:** 보관함 개수 불일치
- **Type:** `saved-template-count-mismatch`
- **Location:** Header -> Library Badge (Purple circle).
- **Data Bug ID Selector:** `[data-bug-id="site074-bug01"]`
- **User Symptom:** 사용자가 템플릿을 보관함에 담았을 때, 실제 담긴 개수보다 하나 적은 숫자가 헤더 배지에 표시됨. (예: 1개 담으면 0, 2개 담으면 1)
- **Technical Cause:** `updateLibraryUI` 함수에서 `savedTemplates.length - 1`을 배지 텍스트로 설정함.
- **Expected Behavior:** 배지 숫자는 `savedTemplates.length`와 일치해야 함.

---

### Bug 02: 미리보기 모달 overflow
- **Bug ID:** `site074-bug02`
- **CSV Error Name:** 미리보기 모달 overflow
- **Type:** `preview-modal-overflow`
- **Location:** Preview Modal (Open any template preview).
- **Data Bug ID Selector:** `[data-bug-id="site074-bug02"]`
- **User Symptom:** 템플릿 미리보기 모달을 열었을 때, 문서 이미지가 모달의 레이아웃을 무시하고 밖으로 크게 넘치며, 닫기 버튼이나 우측 사이드바의 일부를 가림.
- **Technical Cause:** 모달 내 이미지에 `max-width: 100%` 처리가 누락되었고, 컨테이너에 `overflow: hidden` 또는 `scroll` 처리가 되어 있지 않음.
- **Expected Behavior:** 미리보기 이미지는 모달 내부 지정된 영역 안에서 적절한 크기로 리사이징되어야 함.

---

### Bug 03: 미리보기 버튼 무반응
- **Bug ID:** `site074-bug03`
- **CSV Error Name:** 미리보기 버튼 무반응
- **Type:** `preview-button-no-response`
- **Location:** Template Grid -> Template ID: T004 ("Weekly Task Planner") -> Preview Button.
- **Data Bug ID Selector:** `[data-bug-id="site074-bug03"]`
- **User Symptom:** "Weekly Task Planner" 카드의 "Preview" 버튼을 눌러도 모달이 열리지 않고 아무런 동작이 없음. (다른 카드의 버튼은 정상 작동)
- **Technical Cause:** `renderTemplates` 함수에서 `T004` 아이디에 대해서만 `click` 이벤트 리스너 등록 과정을 건너뜀.
- **Expected Behavior:** 모든 "Preview" 버튼은 클릭 시 해당 템플릿의 상세 모달을 열어야 함.
