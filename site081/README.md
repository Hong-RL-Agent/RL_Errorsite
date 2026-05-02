# MakeupShelf

**사이트 이름:** MakeupShelf | **사이트 ID:** site081 | **포트:** 9410

## 기술 스택
| 분류 | 기술 |
|------|------|
| 백엔드 | Node.js, Express |
| 프론트엔드 | HTML5, Vanilla CSS, Vanilla JS |
| 폰트 | DM Sans (Google Fonts) |

## 실행 방법
```bash
cd site081 && npm install && npm start
# → http://localhost:9410
```

## API 엔드포인트
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 |
| GET | `/api/products` | 제품 목록 (brand, category, sort, q) |
| GET | `/api/products/:id` | 제품 상세 |
| GET | `/api/expiring` | 임박 제품 (⚠️ bug01) |
| GET | `/api/reviews/:productId` | 리뷰 목록 |
| POST | `/api/reviews` | 리뷰 작성 |
| GET | `/api/wishlist/:userId` | 위시리스트 (⚠️ bug03) |
| POST | `/api/wishlist/toggle` | 위시리스트 추가/제거 |
| GET | `/api/stats` | 통계 |
| GET | `/api/brands` | 브랜드 목록 |
| GET | `/api/categories` | 카테고리 목록 |

## 정상 작동 기능
1. 제품 검색 (이름/브랜드)
2. 브랜드 필터 칩 선택
3. 카테고리 필터 칩 선택
4. 사용기한 정렬 (빠른순/느린순)
5. 제품 카드 클릭 → 상세 모달
6. 모달 탭 전환 (정보/리뷰/관리)
7. 리뷰 작성 폼 제출
8. 위시리스트 추가/제거 (🤍/❤️ 토글)
9. 임박 제품 조회 (날짜 범위 선택)
10. IDOR 패널에서 타 유저 위시리스트 조회
11. 통계 새로고침
12. 헤더 새로고침 버튼
13. 알림 벨 클릭 → 임박 뷰 이동
14. 모달 닫기 (✕, ESC, 오버레이)

## 의도된 오류 3개 요약

| ID | Type | 설명 |
|----|------|------|
| bug01 | database-date-query | `/api/expiring` — 이미 만료된 제품도 임박 목록에 포함 |
| bug02 | network-missing-field | id:3, id:6 제품에 `productId` 필드 없음 |
| bug03 | security-authorization | `/api/wishlist/:userId` — 소유자 검증 없음, IDOR |

## 참고 문서
- **BUGS.md** — 오류 3개 상세 문서
- **TODO.md** — 구현 현황
