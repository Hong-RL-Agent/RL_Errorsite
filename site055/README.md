# BloomLane 오늘 도착 꽃배달

- 사이트 이름: BloomLane 오늘 도착 꽃배달
- 사이트 ID: site055
- 포트 번호: 9274
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express

## 실행 방법

```bash
cd site055
npm install
npm start
```

브라우저에서 `http://localhost:9274`로 접속합니다.

```bash
npm run dev
npm run build
```

## API 엔드포인트

- `GET /api/health`: 서버 상태 확인
- `GET /api/flowers`: 상품 ID, 이름, 용도, 가격, 이미지, 배송 가능 여부, 추천 여부 mock 데이터
- `GET /api/delivery-options`: 배송 옵션 ID, 이름, 추가 비용, 예상 도착일 mock 데이터

## 정상 작동 기능

- `/api/flowers` 데이터를 `fetch`로 받아 상품 grid 렌더링
- `/api/delivery-options` 데이터를 `fetch`로 받아 배송 옵션 렌더링
- 용도별 필터
- 가격대 필터
- 필터 초기화
- 상품 상세 모달 열기와 닫기
- 배송 지역 선택 반영
- 배송 옵션 선택 UI 상태 변경
- 정상 상품 장바구니 담기와 삭제
- 찜하기 토글
- 추천 상품 carousel 이전/다음
- 장바구니 수량 및 합계 계산
- 준비되지 않은 보조 버튼은 `준비중입니다.` alert 표시
- API 로딩 상태와 에러 상태 UI 표시

## 의도된 프론트엔드 오류 3개

1. `site055-bug01`: 배송 옵션 상태 불일치
   - `오늘 배송` 옵션을 선택해도 장바구니 요약의 배송 옵션 이름은 `일반 배송`으로 남습니다.
2. `site055-bug02`: 상품 이미지 비율 깨짐
   - `피오니 크림 바스켓` 상품 이미지만 `object-fit: fill`로 렌더링되어 비율이 깨져 보입니다.
3. `site055-bug03`: 장바구니 버튼 무반응
   - 추천 상품 `오늘의 로맨스 꽃다발`의 `장바구니 담기` 버튼만 클릭해도 장바구니에 추가되지 않습니다.

자세한 오류 명세는 `BUGS.md`를 확인하세요. 구현 및 확인 상태는 `TODO.md`에 정리되어 있습니다.
