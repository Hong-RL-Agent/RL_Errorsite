# GarageSale Map | site082 | port 9411

## 실행
```bash
cd site082 && npm install && npm start
# → http://localhost:9411
```

## API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 |
| GET | `/api/markets` | 마켓 목록 (region, status, sort, q) |
| GET | `/api/markets/:id` | 마켓 상세 |
| GET | `/api/items/:marketId` | 판매 품목 |
| GET | `/api/applications` | 신청 목록 |
| POST | `/api/applications` | 참가 신청 (⚠️ bug03) |
| GET | `/api/reviews/:marketId` | 후기 목록 |
| POST | `/api/reviews` | 후기 작성 |
| POST | `/api/favorites/toggle` | 즐겨찾기 토글 |
| GET | `/api/favorites` | 즐겨찾기 목록 |
| GET | `/api/regions` | 지역 목록 |

## 정상 인터랙션 (14개)
1. 마켓 검색 / 2. 지역 필터 칩 / 3. 상태 필터 / 4. 정렬 / 5. 마켓 카드 → 상세 모달 / 6. 모달 탭 전환 / 7. 후기 작성 / 8. 즐겨찾기 토글 / 9. 지도 카드 핀 클릭 / 10. bug03 위조 신청 패널 / 11. 일반 참가 신청 폼 / 12. 헤더 새로고침 / 13. 탭 전환 / 14. 모달 닫기

## 의도된 오류 3개
| ID | Type | 설명 |
|----|------|------|
| bug01 | database-sort | `sort=date` 시 문자열 비교 → 패딩 없는 날짜 순서 역전 |
| bug02 | network-partial-response | id:1, id:4 의 `lat`/`lng`가 `null` |
| bug03 | security-authentication | `x-user-id` 헤더 위조로 인증 우회 신청 가능 |
