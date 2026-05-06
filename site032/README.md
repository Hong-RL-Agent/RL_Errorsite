# Maison Reserve

- 사이트 이름: Maison Reserve
- 사이트 ID: site032
- 포트 번호: 9251
- 기술 스택: React + Vite + Express

## 실행 방법

```bash
cd site032
npm install
npm run build
npm start
```

브라우저에서 `http://localhost:9251`로 접속한다. PowerShell 실행 정책 문제가 있으면 `npm.cmd install`, `npm.cmd start`를 사용한다.

## API 엔드포인트

- `GET /api/health`: 서버 상태를 반환한다.
- `GET /api/restaurants`: 매장 ID, 이름, 지역, 평점, 가격대, 가능한 시간, 대표 메뉴, 이미지 데이터를 반환한다.
- `GET /api/tables`: 테이블 번호, 좌석 수, 예약 가능 여부, 위치 데이터를 반환한다.

## 정상 기능 목록

- 지역 필터가 레스토랑 목록을 정상 갱신한다.
- 인원 수 선택 UI가 정상 변경된다.
- 레스토랑 상세 모달 열기/닫기가 정상 동작한다.
- 코스 메뉴 탭 전환이 정상 동작한다.
- 후기 정렬이 최신순/평점순으로 정상 동작한다.
- API 로딩 상태와 에러 상태 UI가 존재한다.
- 구현되지 않은 예약 확인, 로그인, 알레르기 요청, 푸터 링크는 `alert("준비중입니다.")`로 처리한다.

## 의도된 프론트엔드 오류 3개

- `site032-bug01`: 인원수 표시 불일치, `party-size-summary-mismatch`, `data-bug-id="site032-bug01"`
- `site032-bug02`: 테이블 배치도 overflow, `table-map-overflow`, `data-bug-id="site032-bug02"`
- `site032-bug03`: 날짜 선택 상태 지연 반영, `date-selection-lag`, `data-bug-id="site032-bug03"`

## PPO 에이전트가 탐지해야 할 기대 행동

- 인원 선택 UI와 예약 요약 인원 수가 일치하는지 비교한다.
- 1100px 부근 데스크톱 폭에서 좌석 배치도 grid가 예약 요약 패널 쪽으로 넘치는지 확인한다.
- 날짜 변경 후 가능한 시간 영역과 예약 요약 날짜가 한 단계 어긋나는지 확인한다.

## 문서 안내

- `BUGS.md`: 의도된 오류 3개의 위치, 원인, 탐지 포인트를 상세 기록한다.
- `TODO.md`: 생성, 검증, 배포 진행 상태 체크리스트를 기록한다.

## 배포 시 주의사항

- `npm start`는 자동으로 `npm run build`를 먼저 실행한다.
- Express는 `dist`를 서빙하며 없는 asset 요청은 404를 반환한다.
- 캐시 방지 헤더를 적용했다.
