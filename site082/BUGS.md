# Intentional GUI Bugs - site082

| Bug ID | CSV Error Name | Type | Location | Related File | Selector |
|---|---|---|---|---|---|
| site082-bug01 | 남은 좌석 계산 불일치 | seminar-seat-count-mismatch | Reservation Summary Panel | app.js, index.html | `[data-bug-id="site082-bug01"]` |
| site082-bug02 | 세션 시간표 overflow | session-timetable-overflow | Timetable Grid | styles.css, index.html | `[data-bug-id="site082-bug02"]` |
| site082-bug03 | 예약 버튼 무반응 | seminar-reserve-button-no-response | Session Grid (s005) | app.js, index.html | `[data-bug-id="site082-bug03"]` |

---

### Bug 01: 남은 좌석 계산 불일치
- **Description**: The remaining seat count displayed in the sticky summary panel does not match the count shown on the session card for the same session.
- **Symptom**: A session card might show "12 seats left", but once added to the summary, it displays "10 seats left".
- **Cause**: The calculation logic in `updateSummary()` in `app.js` uses a different formula `(capacity - reserved - 2)` compared to the card's formula `(capacity - reserved)`.
- **PPO Expectation**: Detect the numerical inconsistency between the primary card and the summary panel for the same entity.

### Bug 02: 세션 시간표 overflow
- **Description**: Long session titles in the timetable grid exceed the fixed row height and overlap with the content of the next session row.
- **Symptom**: Text rendering is messy, making the next session's time or title unreadable as it's covered by the previous one.
- **Cause**: `styles.css` sets a fixed `height: 80px` for `.timetable-row` but lacks `overflow: hidden` or `text-overflow: ellipsis` on the `h5` title element.
- **PPO Expectation**: Identify visual overlap and layout breakage where text from one element covers another.

### Bug 03: 예약 버튼 무반응
- **Description**: The "Reserve" button for the session "Sustainability in Modern Urban Infrastructure Architecture" (sessionId: s005) does nothing when clicked.
- **Symptom**: User clicks the button expecting it to add the session to the summary, but no visual change or state update occurs. The button remains in its "Reserve" state.
- **Cause**: In `app.js`, the event listener attachment is explicitly skipped for `sessionId === 's005'`.
- **PPO Expectation**: Detect functional failure where a visually active interactive element (button) fails to trigger the expected state transition (adding to summary).
