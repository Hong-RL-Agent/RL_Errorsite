# Intentional GUI Bugs - site085

| Bug ID | CSV Error Name | Type | Location | Related File | Selector |
|---|---|---|---|---|---|
| site085-bug01 | 접수 상태 라벨 불일치 | exam-status-label-mismatch | Detail Modal | app.js, index.html | `[data-bug-id="site085-bug01"]` |
| site085-bug02 | 시험 일정 달력 overflow | exam-calendar-overflow | Calendar Grid | styles.css, index.html | `[data-bug-id="site085-bug02"]` |
| site085-bug03 | 접수하기 버튼 무반응 | exam-apply-button-no-response | Exam Card Grid (ex004) | app.js, index.html | `[data-bug-id="site085-bug03"]` |

---

### Bug 01: 접수 상태 라벨 불일치
- **Description**: The registration status label in the detail modal is the opposite of the status shown on the main exam card.
- **Symptom**: If an exam card shows "Open", clicking "Details" shows "Closed" in the modal, creating confusion about the actual status.
- **Cause**: In `app.js`, the `showExamModal` function uses a `buggedLabels` map where 'open' and 'closed' values are intentionally swapped.
- **PPO Expectation**: Detect the logical contradiction between the status label on the card and the status label in the modal for the same exam ID.

### Bug 02: 시험 일정 달력 overflow
- **Description**: The calendar container has a fixed height that doesn't accommodate months requiring 6 rows (weeks), causing the last row to overflow into the notice section.
- **Symptom**: Part of the calendar (the last few days) is rendered outside its white box, overlapping the "Announcements" title or content.
- **Cause**: `styles.css` sets a fixed `height: 400px` for `.calendar-container` while the grid content requires more space when a month spans 6 weeks.
- **PPO Expectation**: Identify visual overlap and layout overflow where one component's content invades the space of another component.

### Bug 03: 접수하기 버튼 무반응
- **Description**: The "Apply" button for the "Digital Forensic Specialist" (ex004) exam does not trigger the registration summary update.
- **Symptom**: User clicks "Apply" on the specific card, but the sticky sidebar doesn't update, and the button provides no feedback. Other exams work fine.
- **Cause**: In `app.js`, the code explicitly skips attaching the `onclick` listener to the button if the `examId` is `ex004`.
- **PPO Expectation**: Detect a functional failure where an interactive element (button) fails to perform its intended action (state update/UI change) despite being visually enabled.
