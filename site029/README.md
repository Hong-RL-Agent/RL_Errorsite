# PulseTicket Neon

- 사이트 이름: PulseTicket Neon
- 사이트 ID: site029
- 포트 번호: 9248
- 기술 스택: React + Vite + Express

## 실행 방법

```bash
cd site029
npm install
npm start
```

브라우저에서 `http://localhost:9248`로 접속한다.

`npm run dev`를 사용해도 동일하게 `http://localhost:9248` Express 서버가 실행된다.

PowerShell에서 `npm.ps1 cannot be loaded` 실행 정책 오류가 나면 아래처럼 `npm.cmd`를 사용한다.

```bash
npm.cmd install
npm.cmd start
```

## API 엔드포인트

- `GET /api/health`: 서버 상태와 사이트 정보를 반환한다.
- `GET /api/events`: 공연 ID, 제목, 장소, 날짜, 장르, 포스터, 예매 상태, 남은 좌석 데이터를 반환한다.
- `GET /api/ticket-tiers`: 등급명, 가격, 좌석 수, 혜택, 색상 코드를 반환한다.

## 정상 기능 목록

- 공연 검색창으로 공연명을 필터링한다.
- 장르 필터가 공연 카드 목록을 정상 갱신한다.
- 지역 select 필터가 공연 카드 목록을 정상 갱신한다.
- 공연 카드 클릭 시 선택 배지가 이동한다.
- 상세 버튼으로 공연 상세 모달을 열 수 있다.
- 상세 모달을 닫기 버튼 또는 배경 클릭으로 닫을 수 있다.
- 날짜 선택 탭의 active 상태가 정상 변경된다.
- 티켓 등급 카드 선택 상태가 일부 정상 변경된다.
- 예매 버튼과 티켓 오픈 CTA로 checkout drawer를 열 수 있다.
- checkout drawer 닫기 버튼이 정상 동작한다.
- 추천 공연 carousel의 공연을 클릭해 예매 흐름으로 진입할 수 있다.
- API 로딩 상태와 에러 상태 UI가 존재한다.

## 의도된 프론트엔드 오류 3개

1. `site029-bug01`
   - CSV 오류명: 좌석 등급 표시 오류
   - 유형: `ticket-tier-label-mismatch`
   - `data-bug-id="site029-bug01"`
   - 티켓 등급 UI 매핑에서 VIP와 Standard 라벨/색상이 뒤바뀐다.

2. `site029-bug02`
   - CSV 오류명: checkout drawer 잘림
   - 유형: `checkout-drawer-clipped`
   - `data-bug-id="site029-bug02"`
   - checkout drawer가 고정 height와 `overflow: hidden` 때문에 하단 결제 버튼이 잘려 보인다.

3. `site029-bug03`
   - CSV 오류명: 선택 상태 불일치
   - 유형: `ticket-selection-state-mismatch`
   - `data-bug-id="site029-bug03"`
   - 다른 공연을 선택해도 checkout 요약 제목에는 최초 공연명이 남는다.

## PPO 에이전트가 탐지해야 할 기대 행동

- API 데이터의 VIP/Standard 등급과 화면의 라벨 및 색상 배지가 일치하지 않는지 비교한다.
- drawer를 열고 하단 결제 버튼이 화면 아래에서 잘리거나 스크롤 접근이 불가능한지 관찰한다.
- 공연 A를 선택한 뒤 다른 공연 B를 선택하고, 선택 배지와 checkout 요약 제목이 서로 다른지 확인한다.

## 문서 안내

- `BUGS.md`: 의도된 오류 3개의 위치, 원인, 탐지 포인트를 상세 기록한다.
- `TODO.md`: 생성, 검증, 배포 진행 상태 체크리스트를 기록한다.

## 배포 시 주의사항

- `npm run build` 후 `npm start`로 Express가 `dist` 정적 파일을 서빙한다.
- 백엔드 API는 정상 동작해야 하며, 의도된 오류는 프론트엔드 GUI/상태/렌더링/레이아웃 오류로만 유지한다.
- 배포 환경에서 포트가 고정되어야 한다면 `PORT=9248`을 명시한다.
