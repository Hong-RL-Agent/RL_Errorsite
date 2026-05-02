# TinyInvoice | site085 | port 9414

## 실행
```bash
cd site085 && npm install && npm start
# → http://localhost:9414
```

## API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 |
| GET | `/api/invoices` | 청구서 목록 (status, sort, q) |
| GET | `/api/invoices/:id` | 청구서 상세 (⚠️ bug03) |
| POST | `/api/invoices` | 청구서 발행 (⚠️ bug02) |
| PATCH | `/api/invoices/:id/status` | 상태 변경 |
| GET | `/api/customers` | 고객 목록 |
| GET | `/api/reports` | 리포트 (⚠️ bug01 영향) |

## 정상 인터랙션 (13개)
1. 청구서 검색 / 2. 상태 필터 / 3. 정렬 / 4. 청구서 카드 → 상세 모달 / 5. 상태 변경 버튼 / 6. 새 청구서 항목 추가 / 7. 금액 계산 미리보기 / 8. 청구서 발행 폼 / 9. 고객 목록 검색 / 10. 리포트 새로고침 / 11. IDOR 패널 invoiceId 조회 / 12. 헤더 새로고침 / 13. 탭 전환

## 의도된 오류 3개
| ID | Type | 설명 |
|----|------|------|
| bug01 | database-calculation | 세금 계산 시 할인 이중 적용 → 세금 낮게 계산 |
| bug02 | network-duplicate-submit | 발행 버튼 연속 클릭 시 중복 청구서 생성 |
| bug03 | security-idor | `GET /api/invoices/:id` 소유자 검증 없음 → id 4,5 타 유저 청구서 노출 |
