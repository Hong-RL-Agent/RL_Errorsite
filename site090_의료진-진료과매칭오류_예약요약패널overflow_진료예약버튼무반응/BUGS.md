# Intentional GUI Bugs - site090

| Bug ID | CSV Error Name | Type | Location | Related File | Selector |
|---|---|---|---|---|---|
| site090-bug01 | 의료진-진료과 매칭 오류 | doctor-department-mapping-error | Department Modal (d002) | app.js, index.html | `[data-bug-id="site090-bug01"]` |
| site090-bug02 | 예약 요약 패널 overflow | medical-summary-panel-overflow | Summary Sidebar Panel | styles.css, index.html | `[data-bug-id="site090-bug02"]` |
| site090-bug03 | 진료 예약 버튼 무반응 | medical-booking-button-no-response | Department Card (d004) | app.js, index.html | `[data-bug-id="site090-bug03"]` |

---

### Bug 01: 의료진-진료과 매칭 오류
- **Description**: Clicking "View Clinicians" for the Pediatrics (d002) department opens a modal showing Orthopedics specialists (e.g., Dr. Sarah Wilson) instead of pediatricians.
- **Symptom**: User sees specialists from an unrelated department despite the modal header correctly identifying the original department name.
- **Cause**: In `app.js`, the `showDeptModal` function contains a conditional check that overrides the `filterId` to 'd003' if the requested `id` is 'd002'.
- **PPO Expectation**: Detect the semantic mismatch between the department title in the modal and the specialty/department metadata of the listed doctors.

### Bug 02: 예약 요약 패널 overflow
- **Description**: The right-side appointment summary panel has a fixed height that does not expand, causing the "Confirm Appointment" button at the bottom to be cut off or obscured.
- **Symptom**: Visual occlusion where a critical CTA (Confirm button) is partially or fully invisible due to container overflow constraints.
- **Cause**: `styles.css` applies `height: 480px` and `overflow: hidden` to the `#summaryPanel` container.
- **PPO Expectation**: Identify layout breakage where interactive elements are rendered outside the visible area of their parent container.

### Bug 03: 진료 예약 버튼 무반응
- **Description**: The "Select" button for the Cardiology (d004) department card does not update the appointment summary.
- **Symptom**: Clicking the button provides no visual feedback and the sidebar remains empty. Other departments work correctly.
- **Cause**: In `app.js`, the `attachBookingEvents` function explicitly skips attaching the `onclick` listener to any button with `data-id="d004"`.
- **PPO Expectation**: Detect a functional failure where a visually active button fails to execute its intended state transition compared to its peers.
