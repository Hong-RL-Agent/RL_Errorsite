# FoodTruck Map

**사이트 이름:** FoodTruck Map  
**사이트 ID:** site078  
**포트:** 9407  

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 백엔드 | Node.js, Express |
| 프론트엔드 | HTML5, Vanilla CSS, Vanilla JS |
| DB | In-memory Mock DB (JavaScript Array) |
| 폰트 | Pretendard, Noto Sans KR (Google Fonts) |

---

## 실행 방법

```bash
cd site078
npm install
npm start
```

브라우저에서 `http://localhost:9407` 접속

---

## API 엔드포인트 목록

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/trucks` | 푸드트럭 목록 (region, open, sort, q 필터) |
| GET | `/api/menus/:truckId` | 특정 트럭 메뉴 목록 |
| GET | `/api/favorites` | 즐겨찾기 목록 |
| POST | `/api/favorites/toggle` | 즐겨찾기 추가/제거 |
| GET | `/api/reviews/:truckId` | 특정 트럭 리뷰 목록 |
| POST | `/api/reviews` | 리뷰 작성 (⚠️ bug03: 인증 없음) |
| GET | `/api/regions` | 지역 목록 |

---

## 정상 작동 기능 목록

1. **검색** — 트럭 이름, 지역, 카테고리, 태그 키워드 검색
2. **지역 필터** — 강남, 홍대, 이태원, 신촌 등 지역 칩 선택
3. **영업중 필터** — 현재 영업 중인 트럭만 표시
4. **정렬** — 평점순 / 리뷰순 / 이름순 정렬
5. **트럭 카드 클릭** — 상세 모달 오픈
6. **탭 전환** — 메뉴 / 영업정보 / 리뷰 탭 전환
7. **메뉴 상세** — 트럭별 메뉴, 가격, 인기 메뉴 표시
8. **즐겨찾기 추가/제거** — ⭐ 버튼 토글, 즐겨찾기 섹션 실시간 갱신
9. **리뷰 작성** — 모달 내 리뷰 폼 입력 및 제출
10. **지도 마커 클릭** — 사이드바에 트럭 정보 표시
11. **전체 새로고침** — 헤더 새로고침 버튼으로 전체 데이터 갱신
12. **영업 상태 표시** — 각 트럭 카드에 영업중/종료/위치없음 배지
13. **모달 열기/닫기** — ✕ 버튼, 오버레이 클릭, ESC 키
14. **모바일 메뉴 토글** — 햄버거 메뉴 버튼

---

## 의도된 오류 3개 요약

### bug01 — DB 영업시간 비교 오류 (database-date-query)
- 영업 종료된 트럭도 영업중으로 반환됨
- `isOpenNow_buggy()` 함수에서 closeTime 비교를 누락하고 문자열 기반으로만 openTime과 비교
- 발생 위치: `server.js` → `GET /api/trucks`

### bug02 — 네트워크 위치 응답 누락 (network-missing-field)
- 일부 트럭(id: 1, 4)의 API 응답에서 `lat` 또는 `lng` 필드가 누락됨
- Mock DB 객체 생성 시 의도적으로 좌표 필드를 제거
- 발생 위치: `server.js` → `mockTrucks` 배열 → `GET /api/trucks` 응답

### bug03 — 리뷰 작성 인증 누락 (security-authentication)
- `POST /api/reviews` 엔드포인트에 인증 검증 로직이 전혀 없음
- Authorization 헤더 검증 없이 누구나 리뷰를 등록 가능
- 발생 위치: `server.js` → `POST /api/reviews`

---

## 참고 문서

- **BUGS.md** — 의도된 오류 3개의 상세 문서 (PPO 탐지 기대 행동 포함)
- **TODO.md** — 구현 현황 체크리스트
