# BloomLane

- 사이트 이름: BloomLane
- 사이트 ID: site035
- 포트 번호: 9254
- 기술 스택: React + Vite + Express

## 실행 방법

```bash
cd site035
npm install
npm run build
npm start
```

브라우저에서 `http://localhost:9254`로 접속한다. PowerShell 실행 정책 문제가 있으면 `npm.cmd install`, `npm.cmd start`를 사용한다.

## API 엔드포인트

- `GET /api/health`: 서버 상태를 반환한다.
- `GET /api/flowers`: 상품 ID, 이름, 용도, 가격, 이미지, 배송 가능 여부, 추천 여부 데이터를 반환한다.
- `GET /api/delivery-dates`: 날짜, 요일, 배송 가능 여부, 추가 배송비 데이터를 반환한다.

## 정상 기능 목록

- 용도별 필터가 정상 동작한다.
- 가격대 필터가 정상 동작한다.
- 상품 상세 모달 열기/닫기가 정상 동작한다.
- 배송 지역 선택이 정상 반영된다.
- 찜하기 토글이 정상 동작한다.
- API 로딩 상태와 에러 상태 UI가 존재한다.
- 구현되지 않은 버튼은 `alert("준비중입니다.")`로 처리한다.

## 의도된 프론트엔드 오류 3개

- `site035-bug01`: 배송일 표시 undefined, `undefined-delivery-date`, `data-bug-id="site035-bug01"`
- `site035-bug02`: 상품 카드 높이 깨짐, `product-card-height-break`, `data-bug-id="site035-bug02"`
- `site035-bug03`: 주문 버튼 상태 불일치, `order-button-state-mismatch`, `data-bug-id="site035-bug03"`

## PPO 에이전트가 탐지해야 할 기대 행동

- 배송일 라벨이 없는 상품 카드에 `undefined`가 표시되는지 확인한다.
- 긴 상품명 카드의 높이와 버튼 정렬이 다른 카드와 어긋나는지 확인한다.
- 품절 상품의 주문 버튼이 활성 스타일처럼 보이는지 확인한다.

## 문서 안내

- `BUGS.md`: 의도된 오류 3개의 위치, 원인, 탐지 포인트를 상세 기록한다.
- `TODO.md`: 생성, 검증, 배포 진행 상태 체크리스트를 기록한다.
