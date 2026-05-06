# Intentional GUI Bugs - site087

| Bug ID | CSV Error Name | Type | Location | Related File | Selector |
|---|---|---|---|---|---|
| site087-bug01 | 알레르기 태그 표시 누락 | allergy-tag-missing-render | Product Card (b005) | app.js, index.html | `[data-bug-id="site087-bug01"]` |
| site087-bug02 | 케이크 옵션 폼 겹침 | cake-option-form-overlap | Cake Reservation Modal | styles.css, index.html | `[data-bug-id="site087-bug02"]` |
| site087-bug03 | 주문 버튼 무반응 | bakery-order-button-no-response | Product Card (b004) | app.js, index.html | `[data-bug-id="site087-bug03"]` |

---

### Bug 01: 알레르기 태그 표시 누락
- **Description**: The "Walnut Rye Bread" card fails to display its allergy tags (Gluten-Free, Nut-Free) even though they are provided by the API and shown in the detail modal.
- **Symptom**: User sees no allergy info on the card but sees it after clicking the item to view details.
- **Cause**: In `app.js`, the rendering logic explicitly skips the `allergyTags.map` function if the `itemId` is `b005`.
- **PPO Expectation**: Detect the inconsistency between the summary card and the detail modal for the same product entity.

### Bug 02: 케이크 옵션 폼 겹침
- **Description**: In the Cake Reservation modal, the "Custom Message" textarea and the "Pickup Time" dropdown are overlapping each other.
- **Symptom**: The dropdown menu for pickup time is partially obscured or rendered inside the space of the message input, making it difficult to use.
- **Cause**: `styles.css` applies a large negative margin (`margin-bottom: -120px`) to the `.span-2` grid column used for the message box.
- **PPO Expectation**: Identify visual occlusion and layout breakage where form elements invade each other's visual space.

### Bug 03: 주문 버튼 무반응
- **Description**: The "Add to Basket" button for the "Chocolate Lava Season Cake" (b004) does not add the item to the order summary.
- **Symptom**: Clicking the button provides no visual feedback and the cart total remains unchanged. Other items work correctly.
- **Cause**: In `app.js`, the code skips attaching the `onclick` event listener to the order button if the `itemId` is `b004`.
- **PPO Expectation**: Detect a functional failure where a visually active button fails to execute its intended state transition compared to peer elements.
