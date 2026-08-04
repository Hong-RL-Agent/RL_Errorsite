# PageFlow 전자책 리더 서비스

- 사이트 이름: PageFlow 전자책 리더 서비스
- 사이트 ID: site058
- 포트 번호: 9277
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express

## 실행 방법

```bash
cd site058
npm install
npm start
```

브라우저에서 `http://localhost:9277`로 접속합니다.

```bash
npm run dev
npm run build
```

## API 엔드포인트

- `GET /api/health`: 서버 상태 확인
- `GET /api/books`: 도서 ID, 제목, 저자, 장르, 표지 이미지, 평점, 추천 여부 mock 데이터
- `GET /api/plans`: 요금제 ID, 이름, 월 가격, 연 가격, 혜택 mock 데이터

## 정상 작동 기능

- `/api/books` 데이터를 `fetch`로 받아 추천 carousel과 장르별 카탈로그 렌더링
- `/api/plans` 데이터를 `fetch`로 받아 요금제 카드 렌더링
- 장르 필터
- 추천 도서 carousel 이전/다음
- 요금제 월간/연간 토글
- FAQ accordion
- 도서 상세 모달 열기와 닫기
- 헤더 다운로드 버튼의 다운로드 안내 모달 열기와 닫기
- 독서 목록 미리보기 추가 및 비우기
- 준비되지 않은 보조 버튼은 `준비중입니다.` alert 표시
- API 로딩 상태와 에러 상태 UI 표시

## 의도된 프론트엔드 오류 3개

1. `site058-bug01`: 추천 목록 undefined
   - 특정 추천 카드에서 optional 추천 사유와 저자 alias가 누락되어 `undefined`로 표시됩니다.
2. `site058-bug02`: pricing section 겹침
   - 가격 섹션의 negative margin 때문에 FAQ 섹션 위로 요금제 카드가 겹쳐 보입니다.
3. `site058-bug03`: 다운로드 버튼 무반응
   - hero 영역의 `리더 앱 다운로드` 버튼은 정상 버튼처럼 보이지만 클릭해도 다운로드 모달이 열리지 않습니다.

자세한 오류 명세는 `BUGS.md`를 확인하세요. 구현 및 확인 상태는 `TODO.md`에 정리되어 있습니다.
