# Grand Note

- 사이트 이름: Grand Note
- 사이트 ID: site086
- 포트 번호: 9305
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express
- 주제: 온라인 악기 쇼핑 웹사이트

## 실행 방법

```bash
cd site086
npm install
npm start
```

브라우저에서 `http://localhost:9305`로 접속한다.

## API 엔드포인트

- `GET /api/health`: 서비스 상태와 사이트 ID를 반환한다.
- `GET /api/instruments`: 상품 ID, 이름, 브랜드, 악기 종류, 가격, 이미지, 평점, 재고 상태, 추천 여부를 반환한다.
- `GET /api/brands`: 브랜드 ID, 이름, 설명, 대표 악기를 반환한다.

## 정상 작동 기능

- 악기 종류 필터
- 브랜드 필터
- 가격대 필터
- 재고 상품만 보기 필터
- 입문자 추천 필터
- 상품 검색
- 상품 정렬
- 상품 상세 모달 열기와 닫기
- 정상 상품 장바구니 담기
- 장바구니 수량 증가와 감소
- 장바구니 상품 삭제
- 장바구니 요약 패널 접기와 펼치기
- 악기 관리 팁 accordion 열기와 닫기
- 추천 악기 CTA 스크롤 이동
- API 로딩 상태와 에러 상태 UI
- 미구현 메뉴와 버튼의 `준비중입니다.` 알림

## 의도된 프론트엔드 오류 3개

- `site086-bug01`: 재고 상태 표시 불일치
- `site086-bug02`: 상품 비교표 overflow
- `site086-bug03`: 장바구니 담기 버튼 무반응

상세 내용은 `BUGS.md`에 기록되어 있으며, 생성 및 검증 진행 상태는 `TODO.md`에서 확인할 수 있다.
