# Walnut Room 가구 쇼룸

- 사이트 이름: Walnut Room 가구 쇼룸
- 사이트 ID: site061
- 포트 번호: 9280
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express

## 실행 방법

```bash
cd site061
npm install
npm start
```

브라우저에서 `http://localhost:9280`으로 접속합니다.

```bash
npm run dev
npm run build
```

## API 엔드포인트

- `GET /api/health`: 서버 상태 확인
- `GET /api/furniture`: 상품 ID, 이름, 공간, 소재, 색상 옵션, 가격, 이미지, 배송 예정일 mock 데이터
- `GET /api/showrooms`: 쇼룸 ID, 지역, 주소, 운영 시간, 전시 스타일 mock 데이터

## 정상 작동 기능

- `/api/furniture` 데이터를 `fetch`로 받아 상품 grid 렌더링
- `/api/showrooms` 데이터를 `fetch`로 받아 쇼룸 카드 렌더링
- 공간별 필터
- 소재, 색상, 가격대, 배송 가능 필터
- 상품 검색
- 색상 swatch 선택 상태 표시
- 상품 상세 모달 열기와 닫기
- 정상 상품의 견적 요청 및 우측 요약 반영
- 견적 요약 패널 접기/펼치기
- 스타일 가이드 accordion
- 준비되지 않은 보조 버튼은 `준비중입니다.` alert 표시
- API 로딩 상태와 에러 상태 UI 표시

## 의도된 프론트엔드 오류 3개

1. `site061-bug01`: 색상 옵션 표시 불일치
   - `월넛` swatch를 선택해도 선택 배지에는 `오크`로 표시됩니다.
2. `site061-bug02`: 갤러리 썸네일 깨짐
   - 상품 상세 모달의 썸네일 갤러리가 고정 폭으로 넘치고 썸네일 이미지가 찌그러집니다.
3. `site061-bug03`: 견적 요청 버튼 무반응
   - `모듈러 월넛 소파` 카드의 `견적 요청` 버튼만 클릭해도 우측 견적 요약에 추가되지 않습니다.

자세한 오류 명세는 `BUGS.md`를 확인하세요. 구현 및 확인 상태는 `TODO.md`에 정리되어 있습니다.
