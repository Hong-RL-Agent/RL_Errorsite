# BlueSnap Print

- 사이트 이름: BlueSnap Print
- 사이트 ID: `site064`
- 포트 번호: `9283`
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express
- 주제: 사진 인화 서비스 / 포토북 주문 웹사이트

## 실행 방법

```bash
cd site064
npm install
npm start
```

브라우저에서 `http://localhost:9283`에 접속합니다.

개발 실행도 동일하게 가능합니다.

```bash
npm run dev
```

빌드 검증:

```bash
npm run build
```

## API 엔드포인트

- `GET /api/health`: 서비스 상태 확인
- `GET /api/print-options`: 인화 옵션 ID, 이름, 사이즈, 가격, 용지 타입, 추천 여부 반환
- `GET /api/sample-photos`: 사진 ID, 파일명, 썸네일 URL, 비율, 선택 여부 반환

## 정상 작동 기능

- 인화 옵션 API 데이터를 fetch로 받아 옵션 카드에 렌더링
- 샘플 사진 API 데이터를 fetch로 받아 미리보기 grid에 렌더링
- 인화 사이즈 선택
- 수량 증가/감소와 주문 요약 반영
- 사진 선택/해제
- 사진 미리보기 모달 열기/닫기
- 옵션 필터: 용지 타입, 사이즈, 추천 옵션
- 주문 요약 패널 접기/펼치기
- API 로딩 상태와 에러 상태 UI
- 아직 구현하지 않은 메뉴와 주문서 버튼은 `준비중입니다.` alert 표시

## 의도된 프론트엔드 오류 3개

1. `site064-bug01`: 선택 수량 표시 오류
   - 선택된 사진 배열은 정상 관리되지만 주문 요약에는 실제보다 1장 적게 표시됩니다.
2. `site064-bug02`: preview grid 깨짐
   - 세로 사진과 가로 사진이 섞일 때 일부 세로 썸네일이 고정 높이 카드 밖으로 넘쳐 grid 행과 겹칩니다.
3. `site064-bug03`: 업로드 다음 버튼 무반응
   - 실제 DOM 버튼 id와 JavaScript selector id가 달라 다음 단계 버튼에 click listener가 연결되지 않습니다.

자세한 오류 위치와 PPO 탐지 기대 행동은 `BUGS.md`를 확인하세요. 생성 및 검증 체크리스트는 `TODO.md`에 기록되어 있습니다.
