# BUGS.md — site085 TinyInvoice

## bug01
| 항목 | 내용 |
|------|------|
| **bugId** | site085-bug01 |
| **CSV 오류명** | DB 세금 계산 오류 |
| **type** | database-calculation |
| **발생 위치** | `server.js` — `calcInvoiceTotals_buggy()` |
| **data-bug-id** | `[data-bug-id="site085-bug01"]` |

### 증상
- 할인율 10%, 세율 10%, 소계 4,400,000원 기준:
  - 정상 세금: `(4,400,000 × 0.9) × 0.1 = 396,000원`
  - 버그 세금: `(4,400,000 × 0.9 × 0.9) × 0.1 = 356,400원`
- 리포트의 총 청구액도 낮게 집계됨

### 원인
```javascript
// data-bug-id="site085-bug01"
const tax = discounted * (1 - discountRate / 100) * (taxRate / 100); // 이중 할인
// 정상: const tax = discounted * (taxRate / 100);
```

### PPO 탐지 기대
- `(subtotal × (1-disc) × taxRate)` 와 `(subtotal × (1-disc) × (1-disc) × taxRate)` 비교 시 database-calculation 플래그
- tax 값이 `discounted * taxRate`와 일치하지 않으면 감지

---

## bug02
| 항목 | 내용 |
|------|------|
| **bugId** | site085-bug02 |
| **CSV 오류명** | 네트워크 중복 발행 |
| **type** | network-duplicate-submit |
| **발생 위치** | `server.js` — `POST /api/invoices` |
| **data-bug-id** | `[data-bug-id="site085-bug02"]` |

### 증상
- 발행 버튼을 연속으로 클릭하면 동일한 내용의 청구서가 여러 개 생성
- 번호가 다른 INV-2026-00X 청구서가 중복 발행됨

### 원인
```javascript
// data-bug-id="site085-bug02"
// 멱등성 키(idempotency key) 확인 없이 요청마다 새 청구서 생성
app.post('/api/invoices', (req, res) => {
  // 정상: idempotency key로 중복 요청 탐지 및 기존 결과 반환
  const newInvoice = { id: invoiceIdCounter++, ... };
  mockInvoices.unshift(newInvoice);
});
```

### PPO 탐지 기대
- 동일 payload로 `POST /api/invoices` 여러 번 → 서로 다른 `id`, `invoiceNo`로 201 응답 → network-duplicate-submit 플래그

---

## bug03
| 항목 | 내용 |
|------|------|
| **bugId** | site085-bug03 |
| **CSV 오류명** | 청구서 소유자 검증 누락 |
| **type** | security-idor |
| **발생 위치** | `server.js` — `GET /api/invoices/:id` |
| **data-bug-id** | `[data-bug-id="site085-bug03"]` |

### 증상
- `GET /api/invoices/4` → `user_ken`의 청구서(INV-2026-K01) 노출
- `GET /api/invoices/5` → `user_sarah`의 청구서(INV-2026-S01) 노출
- 청구서 탭 IDOR 패널에서 id 4, 5 입력으로 재현

### 원인
```javascript
// data-bug-id="site085-bug03"
// inv.userId !== CURRENT_USER 검증 없음
// 정상: if (inv.userId !== CURRENT_USER) return res.status(403)...
res.json({ success: true, data: { ...inv, totals } });
```

### PPO 탐지 기대
- `userId`가 현재 사용자와 다른 청구서를 조회했는데 200 반환 시 security-idor 플래그
