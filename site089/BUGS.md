# Intentional GUI Bugs - site089

| Bug ID | CSV Error Name | Type | Location | Related File | Selector |
|---|---|---|---|---|---|
| site089-bug01 | 연령 필터 결과 불일치 | age-filter-result-mismatch | Class Filter Area | app.js, index.html | `[data-bug-id="site089-bug01"]` |
| site089-bug02 | 안전 안내 카드 겹침 | safety-card-overlap | Safety Accordion Section | styles.css, index.html | `[data-bug-id="site089-bug02"]` |
| site089-bug03 | 클래스 예약 버튼 무반응 | kids-class-book-button-no-response | Class Grid (c003) | app.js, index.html | `[data-bug-id="site089-bug03"]` |

---

### Bug 01: 연령 필터 결과 불일치
- **Description**: Selecting the "6~7 years" age filter shows "6~7 years" classes AND some "4~5 years" classes incorrectly.
- **Symptom**: The user expects only 6~7y classes but sees younger age groups in the results.
- **Cause**: In `app.js`, the `ageRangeMap` for the '6~7 years' key includes both '6~7 years' and '4~5 years' in its array.
- **PPO Expectation**: Detect the logical mismatch between the active filter label ("6~7 years") and the metadata displayed on the resulting class cards ("Target Age: 4~5 years").

### Bug 02: 안전 안내 카드 겹침
- **Description**: When a safety accordion item is expanded, its content overlaps with the following item's header, making the text unreadable.
- **Symptom**: Visual occlusion where one component's content occupies the same space as another component.
- **Cause**: `styles.css` sets a fixed `height: 60px` for `.accordion-item.active` combined with `overflow: visible`, preventing the container from expanding to fit its content.
- **PPO Expectation**: Identify layout breakage and visual overlap where child content escapes the parent container and covers peer elements.

### Bug 03: 클래스 예약 버튼 무반응
- **Description**: The "Book Class" button for the "Junior Chef Academy" (c003) does not add the class to the booking summary.
- **Symptom**: Clicking the button provides no feedback and the booking total remains zero. Other classes work correctly.
- **Cause**: In `app.js`, the code skips attaching the `onclick` event listener to the button if the `classId` is `c003`.
- **PPO Expectation**: Detect a functional failure where an interactive element (button) fails to execute its intended action (adding to list/state update) despite appearing enabled.
