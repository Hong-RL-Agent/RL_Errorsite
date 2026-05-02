# BUGS.md — site081 MakeupShelf

## bug01
| 항목 | 내용 |
|------|------|
| **bugId** | site081-bug01 |
| **CSV 오류명** | DB 만료일 필터 오류 |
| **type** | database-date-query |
| **발생 위치** | `server.js` — `GET /api/expiring` |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site081-bug01"]` |

### 사용자가 경험하는 증상
- 임박 제품 목록에 이미 만료된 제품(id:5, expiryDate: 2026-04-01)이 포함됨
- `daysLeft`가 음수인 제품이 임박 목록에 나타나며 "X일 초과 만료" 표시

### 코드상 의도된 원인
```javascript
// data-bug-id="site081-bug01"
// 하한(>= 0) 체크 누락 → 만료된 제품도 포함
const expiring = mockProducts.filter(p => {
  const d = daysFromToday(p.expiryDate);
  return d <= daysNum; // 정상: d >= 0 && d <= daysNum
});
```

### PPO 에이전트 기대 행동
- `/api/expiring` 응답에서 `daysLeft < 0`인 항목이 있으면 database-date-query 오류 플래그
- 만료일이 현재 날짜보다 이전인 제품이 임박 목록에 포함되는지 검증

---

## bug02
| 항목 | 내용 |
|------|------|
| **bugId** | site081-bug02 |
| **CSV 오류명** | API 필드 누락 |
| **type** | network-missing-field |
| **발생 위치** | `server.js` — `mockProducts` 배열 (id:3, id:6), `GET /api/products` 응답 |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site081-bug02"]` |

### 사용자가 경험하는 증상
- id:3(볼륨업 마스카라), id:6(선크림 에센스) 제품의 `productId` 필드가 응답 JSON에 없음
- 프론트엔드에서 "⚠️ ID없음" 표시 및 모달에서 "productId 누락 (bug02)" 표시

### 코드상 의도된 원인
```javascript
// data-bug-id="site081-bug02"
// id:3 — productId 키 자체가 mockProducts 배열에서 제거됨
{ id: 3, /* productId: 'PRD-003' 누락 */ name: '볼륨업 마스카라 블랙', ... }
// id:6 — 동일하게 productId 누락
{ id: 6, /* productId: 'PRD-006' 누락 */ name: '선크림 에센스 SPF50+', ... }
```

### PPO 에이전트 기대 행동
- `/api/products` 응답 JSON에서 `productId` 필드 부재 레코드 탐지
- 전체 제품 중 `productId`가 없는 레코드 비율과 해당 id 목록 보고

---

## bug03
| 항목 | 내용 |
|------|------|
| **bugId** | site081-bug03 |
| **CSV 오류명** | 위시리스트 소유자 검증 누락 |
| **type** | security-authorization |
| **발생 위치** | `server.js` — `GET /api/wishlist/:userId` |
| **관련 파일** | `server.js` |
| **data-bug-id selector** | `[data-bug-id="site081-bug03"]` |

### 사용자가 경험하는 증상
- 위시리스트 탭의 IDOR 패널에서 `user_bob`, `user_carol` 입력 시 타 사용자 위시리스트 조회 성공
- 403 없이 200 OK로 타 사용자의 제품 목록 반환

### 코드상 의도된 원인
```javascript
// data-bug-id="site081-bug03"
app.get('/api/wishlist/:userId', (req, res) => {
  // CURRENT_USER !== userId 검증 완전 누락
  // 정상: if (userId !== CURRENT_USER) return res.status(403)...
  const wishlistIds = mockWishlists[userId] || [];
  res.json({ success: true, data: products, userId });
});
```

### PPO 에이전트 기대 행동
- `GET /api/wishlist/user_bob` (현재 사용자 != user_bob) 요청 시 403이 아닌 200 반환이면 security-authorization 플래그
- 응답 `userId`와 현재 세션 사용자 불일치 시 IDOR 탐지
