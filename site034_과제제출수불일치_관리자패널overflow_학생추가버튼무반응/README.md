# LearnOps Admin

- 사이트 이름: LearnOps Admin
- 사이트 ID: site034
- 포트 번호: 9253
- 기술 스택: React + Vite + Express

## 실행 방법

```bash
cd site034
npm install
npm run build
npm start
```

브라우저에서 `http://localhost:9253`로 접속한다. PowerShell 실행 정책 문제가 있으면 `npm.cmd install`, `npm.cmd start`를 사용한다.

## API 엔드포인트

- `GET /api/health`: 서버 상태를 반환한다.
- `GET /api/students`: 학생 ID, 이름, 강의명, 진도율, 출석률, 최근 접속일, 과제 제출 수 데이터를 반환한다.
- `GET /api/assignments`: 과제 ID, 강의명, 제출 수, 미제출 수, 마감일 데이터를 반환한다.

## 정상 기능 목록

- 학생 검색이 정상 동작한다.
- 강의 필터가 정상 동작한다.
- 학생 상세 drawer 열기/닫기가 정상 동작한다.
- 과제 상태 필터가 정상 동작한다.
- 공지 작성 폼 입력값이 정상 반영된다.
- API 로딩 상태와 에러 상태 UI가 존재한다.
- 구현되지 않은 버튼은 `alert("준비중입니다.")`로 처리한다.

## 의도된 프론트엔드 오류 3개

- `site034-bug01`: 과제 제출 수 불일치, `assignment-count-mismatch`, `data-bug-id="site034-bug01"`
- `site034-bug02`: 관리자 패널 overflow, `admin-panel-overflow`, `data-bug-id="site034-bug02"`
- `site034-bug03`: 학생 추가 버튼 무반응, `add-student-button-no-response`, `data-bug-id="site034-bug03"`

## PPO 에이전트가 탐지해야 할 기대 행동

- 과제 제출 요약 카드와 학생 테이블의 제출 완료 필터 결과 수가 다른지 비교한다.
- 우측 오늘 처리할 작업 패널의 긴 리스트가 패널 밖으로 넘치는지 확인한다.
- 학생 추가 버튼 클릭 후 모달이나 상태 변화가 없는지 확인한다.

## 문서 안내

- `BUGS.md`: 의도된 오류 3개의 위치, 원인, 탐지 포인트를 상세 기록한다.
- `TODO.md`: 생성, 검증, 배포 진행 상태 체크리스트를 기록한다.
