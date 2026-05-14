# Intentional GUI Bugs - site083

| Bug ID | CSV Error Name | Type | Location | Related File | Selector |
|---|---|---|---|---|---|
| site083-bug01 | 찜 개수 불일치 | wishlist-count-mismatch | Header Wishlist Badge | app.js, index.html | `[data-bug-id="site083-bug01"]` |
| site083-bug02 | 상품 카드 이미지 겹침 | accessory-image-overlap | Product Grid (a001) | styles.css, index.html | `[data-bug-id="site083-bug02"]` |
| site083-bug03 | 장바구니 버튼 무반응 | accessory-cart-button-no-response | Product Grid (a004) | app.js, index.html | `[data-bug-id="site083-bug03"]` |

---

### Bug 01: 찜 개수 불일치
- **Description**: The heart badge in the header shows one less than the actual number of items added to the wishlist.
- **Symptom**: If you "heart" 3 items, the badge shows "2". If you "heart" 1 item, it shows "0".
- **Cause**: The `updateWishlistBadge()` function in `app.js` returns `wishlist.length - 1`.
- **PPO Expectation**: Compare the number of active "heart" icons on the page with the numerical badge in the header to detect the mismatch.

### Bug 02: 상품 카드 이미지 겹침
- **Description**: On the "Eternal Rose Gold Necklace" card, the image is positioned incorrectly, covering the product name and price.
- **Symptom**: The product text is obscured by the product image, making the price unreadable.
- **Cause**: `styles.css` uses `position: absolute` with a `top: 50px` offset on the image for this specific card, and the card container lacks sufficient padding or layout isolation.
- **PPO Expectation**: Detect visual occlusion where an image element overlaps a text element (title/price).

### Bug 03: 장바구니 버튼 무반응
- **Description**: The "Add to Bag" button for the "Celestial Diamond Ring" (a004) does not add the item to the cart summary.
- **Symptom**: Clicking the button does nothing—no animation, no cart update, no sidebar opening. Other products work correctly.
- **Cause**: In `app.js`, the click event listener attachment is skipped for `id === 'a004'`.
- **PPO Expectation**: Identify an interactive element (button) that fails to trigger the expected response (state change/UI update) compared to identical elements in the same grid.
