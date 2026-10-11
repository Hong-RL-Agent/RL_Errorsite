# ReMarket (B-02)

ReMarket은 개인 간 중고물품 거래, 판매, 예약, 찜, 채팅, 알림을 다루는 학습용 중고거래 플랫폼입니다.

- 사이트 ID: B-02
- 학습 용도: Training
- 확인전략: ACTION_REPLAY
- Frontend: Next.js App Router, React
- Backend: Node.js, Express
- DB: SQLite

## 실행 방법

Backend:

```bash
cd siteB02_중고거래/backend
npm install
npm run dev
```

Frontend:

```bash
cd siteB02_중고거래/frontend
npm install
npm run dev
```

- Backend: http://localhost:9716
- Frontend: http://localhost:5317
- API 기본 주소: http://localhost:9716

## 주요 기능

- 상품 검색, 카테고리 필터, 지역 필터, 가격 범위 필터
- 최신순, 가격순, 인기순 정렬
- 상품 목록, 인기 상품형 카드, 상품 상세, 이미지 갤러리
- 판매자 프로필 패널
- 상품 등록, 수정, 삭제
- 내 판매 목록, 구매 내역, 거래 예약 목록
- 찜 추가 및 취소
- 거래 예약, 예약 취소, 거래 완료 처리
- 판매자·구매자 채팅 및 메시지 작성
- 거래 알림, 활동 내역
- 데이터 초기화

## API 엔드포인트

```text
GET    /api/health
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
GET    /api/categories
GET    /api/users
GET    /api/users/:id
GET    /api/users/:id/products
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:productId
GET    /api/reservations
POST   /api/reservations
PATCH  /api/reservations/:id
DELETE /api/reservations/:id
GET    /api/transactions
POST   /api/transactions/:id/complete
GET    /api/chats
GET    /api/chats/:id/messages
POST   /api/chats/:id/messages
GET    /api/notifications
GET    /api/activity
POST   /api/test/reset
```

## 의도적 오류 5개

1. B02-ERR01: 거래 예약 버튼의 중복 실행
2. B02-ERR02: 찜 상태 캐시 불일치
3. B02-ERR03: 상품 삭제 시 확인 단계 누락
4. B02-ERR04: 거래 완료 피드백 누락
5. B02-ERR05: 상품 더보기 중복 노출

## 오류 재현 시나리오

- B02-ERR01: 판매중 상품 `P0007` 또는 `P0021` 상세를 열고 거래 예약 모달의 `거래 예약하기`를 한 번 클릭하면 예약 API가 두 번 호출되고 서로 다른 예약 ID 두 건이 생성됩니다.
- B02-ERR02: 찜하지 않은 상품 상세에서 `찜하기`를 클릭하면 상세 하트만 선택 상태가 되고 헤더 찜 개수와 기존 찜 목록 캐시는 갱신되지 않습니다.
- B02-ERR03: 내 판매 목록에서 `P0012` 상품의 `삭제` 버튼을 클릭하면 확인 모달 없이 즉시 DELETE API가 호출됩니다.
- B02-ERR04: 내 거래 내역의 `P0018` 예약중 거래에서 `거래 완료 처리`를 클릭하면 상태는 거래완료로 바뀌지만 성공 토스트가 표시되지 않습니다.
- B02-ERR05: 메인 상품 목록 1페이지에서 `상품 더보기`를 클릭하면 이전 페이지 마지막 3개 상품이 다시 병합되어 같은 상품 ID 카드가 중복 표시됩니다.

## Reset API

`POST /api/test/reset`은 SQLite 데이터를 고정 seed 상태로 복원합니다. 상품, 예약, 찜, 거래, 채팅, 알림, 활동 로그가 동일한 ID와 상태로 재생성되어 같은 클릭 행동으로 오류를 반복 재현할 수 있습니다.
