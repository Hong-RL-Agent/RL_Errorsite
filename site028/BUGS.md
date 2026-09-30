# AuraVoyage (site028) Vulnerability Matrix

| bugId | csvId | Category | Family | Type | Korean Summary | Target Endpoint | Missing Headers |
|---|---|---|---|---|---|---|---|
| site028-bug01 | SEC-281 | session-config | security-headers | security-headers | 보안 헤더 누락 (로그인 폼) | `POST /api/login` | `Content-Security-Policy` |
| site028-bug02 | SEC-282 | session-config | security-headers | security-headers | 보안 헤더 누락 (회원가입 폼) | `POST /api/register` | `Strict-Transport-Security` |
| site028-bug03 | SEC-283 | session-config | security-headers | security-headers | 보안 헤더 누락 (주소 필드) | `POST /api/profile/address` | `X-Content-Type-Options` |
| site028-bug04 | SEC-284 | session-config | security-headers | security-headers | 보안 헤더 누락 (쿠폰 필드) | `POST /api/coupon` | `Content-Security-Policy`, `Strict-Transport-Security` |
| site028-bug05 | SEC-285 | session-config | security-headers | security-headers | 보안 헤더 누락 (정렬 파라미터) | `GET /api/flights?sort=` | `Strict-Transport-Security`, `X-Content-Type-Options` |
| site028-bug06 | SEC-286 | session-config | security-headers | security-headers | 보안 헤더 누락 (페이지네이션) | `GET /api/flights?page=` | `Content-Security-Policy`, `X-Content-Type-Options` |
| site028-bug07 | SEC-287 | session-config | security-headers | security-headers | 보안 헤더 누락 (숙소 검색 필터) | `GET /api/accommodations?location=` | `Content-Security-Policy`, `Strict-Transport-Security` |
| site028-bug08 | SEC-288 | session-config | security-headers | security-headers | 보안 헤더 누락 (예약 정보 조회) | `GET /api/bookings/:bookingId` | `Content-Security-Policy`, `X-Content-Type-Options` |
| site028-bug09 | SEC-289 | session-config | security-headers | security-headers | 보안 헤더 누락 (찜 목록 저장) | `POST /api/wishlist` | `X-Content-Type-Options` |
| site028-bug10 | SEC-290 | session-config | security-headers | security-headers | 보안 헤더 누락 (여행 일정 저장) | `POST /api/itineraries` | `Strict-Transport-Security` |
