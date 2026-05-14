# NexusRank

- 사이트 이름: NexusRank
- 사이트 ID: site033
- 포트 번호: 9252
- 기술 스택: React + Vite + Express

## 실행 방법

```bash
cd site033
npm install
npm run build
npm start
```

브라우저에서 `http://localhost:9252`로 접속한다. PowerShell 실행 정책 문제가 있으면 `npm.cmd install`, `npm.cmd start`를 사용한다.

## API 엔드포인트

- `GET /api/health`: 서버 상태를 반환한다.
- `GET /api/rankings`: 순위, 플레이어명, 팀, 점수, 승률, 최근 전적, 티어 데이터를 반환한다.
- `GET /api/matches`: 최근 경기 ID, 팀명, 결과, 경기 시간, 맵 데이터를 반환한다.

## 정상 기능 목록

- 게임 선택 드롭다운이 정상 동작한다.
- 시즌 선택이 정상 동작한다.
- 플레이어 검색이 정상 동작한다.
- 랭킹 테이블 정렬이 정상 동작한다.
- 플레이어 상세 모달 열기/닫기가 정상 동작한다.
- 팔로우 토글이 정상 동작한다.
- API 로딩 상태와 에러 상태 UI가 존재한다.
- 구현되지 않은 푸터/로그인 링크는 `alert("준비중입니다.")`로 처리한다.

## 의도된 프론트엔드 오류 3개

- `site033-bug01`: 랭킹 순위 중복, `duplicate-ranking-position`, `data-bug-id="site033-bug01"`
- `site033-bug02`: 카드 플립 레이아웃 깨짐, `card-flip-layout-break`, `data-bug-id="site033-bug02"`
- `site033-bug03`: 새로고침 버튼 무반응, `refresh-button-no-response`, `data-bug-id="site033-bug03"`

## PPO 에이전트가 탐지해야 할 기대 행동

- API rank 값과 테이블 표시 순위를 비교해 중복 순위 표시를 찾는다.
- 플레이어 카드 flip 후 뒷면 정보가 카드 밖으로 삐져나오거나 앞면과 겹치는지 확인한다.
- 랭킹 새로고침 버튼 클릭 후 데이터 갱신이나 로딩 반응이 없는지 확인한다.

## 문서 안내

- `BUGS.md`: 의도된 오류 3개의 위치, 원인, 탐지 포인트를 상세 기록한다.
- `TODO.md`: 생성, 검증, 배포 진행 상태 체크리스트를 기록한다.

## 배포 시 주의사항

- `npm start`는 자동으로 `npm run build`를 먼저 실행한다.
- Express는 `dist`를 서빙하며 없는 asset 요청은 404를 반환한다.
- 캐시 방지 헤더를 적용했다.
