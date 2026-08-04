# BlueMap Realty

- 사이트 이름: BlueMap Realty
- 사이트 ID: site088
- 포트 번호: 9307
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express
- 주제: 온라인 지도 기반 부동산 매물 웹사이트

## 실행 방법

```bash
cd site088
npm install
npm start
```

브라우저에서 `http://localhost:9307`로 접속한다.

## API 엔드포인트

- `GET /api/health`: 서비스 상태와 사이트 ID를 반환한다.
- `GET /api/listings`: 매물 ID, 제목, 지역, 거래 유형, 가격, 면적, 방 수, 좌표 mock, 이미지, 중개사 데이터를 반환한다.
- `GET /api/regions`: 지역명, 평균 가격, 매물 수, 인기 여부를 반환한다.

## 정상 작동 기능

- 지역 검색
- 거래 유형 필터
- 가격 필터
- 필터 초기화
- 매물 카드 선택
- 매물 상세 모달 열기와 닫기
- 지도 mock 마커 선택 표시
- 상담 요약 패널 접기와 펼치기
- 정상 매물 상담 문의 버튼으로 상담 요약 반영
- 상단 지도 보기 버튼 스크롤 이동
- 상단 상담 문의 버튼 스크롤 이동
- 추천 매물 렌더링
- 지역 시세 mock 카드 렌더링
- API 로딩 상태와 에러 상태 UI
- 미구현 버튼의 `준비중입니다.` 알림

## 의도된 프론트엔드 오류 3개

- `site088-bug01`: 지도 마커와 목록 불일치
- `site088-bug02`: 지도 패널 overlay 오류
- `site088-bug03`: 상담 문의 버튼 무반응

상세 내용은 `BUGS.md`에 기록되어 있으며, 생성 및 검증 진행 상태는 `TODO.md`에서 확인할 수 있다.
