# MentorLink

- 사이트 이름: MentorLink
- 사이트 ID: site030
- 포트 번호: 9249
- 기술 스택: React + Vite + Express

## 실행 방법

```bash
cd site030
npm install
npm run build
npm start
```

브라우저에서 `http://localhost:9249`로 접속한다. PowerShell 실행 정책 문제 시 `npm.cmd install`, `npm.cmd start`를 사용한다.

## API 엔드포인트

- `GET /api/health`: 서버 상태와 사이트 정보를 반환한다.
- `GET /api/mentors`: 멘토 ID, 이름, 분야, 경력, 평점, 상담 가격, 가능 시간, 프로필 이미지 데이터를 반환한다.
- `GET /api/reviews`: 멘토 ID, 작성자, 별점, 후기 내용, 작성일 데이터를 반환한다.

## 정상 기능 목록

- 멘토 검색이 이름과 분야 기준으로 정상 동작한다.
- 분야 필터가 멘토 카드 목록을 정상 갱신한다.
- 경력 필터가 정상 동작한다.
- 멘토 카드 선택 시 예약 패널의 멘토가 갱신된다.
- 멘토 상세 모달 열기/닫기가 정상 동작한다.
- 시간 슬롯 선택 버튼의 active 표시가 정상 변경된다.
- 후기 정렬을 최신순/별점순으로 전환할 수 있다.
- API 로딩 상태와 에러 상태 UI가 존재한다.
- 구현되지 않은 CTA, 로그인, 푸터 링크, 예약 요청은 `alert("준비중입니다.")`로 처리한다.
- 추천 멘토 카드를 클릭하면 선택 멘토가 변경된다.

## 의도된 프론트엔드 오류 3개

1. `site030-bug01`
   - CSV 오류명: 평점 undefined 표시
   - 유형: `undefined-rating-render`
   - `data-bug-id="site030-bug01"`
   - rating이 누락된 멘토 카드에 `undefined`가 그대로 표시된다.

2. `site030-bug02`
   - CSV 오류명: 프로필 카드 이미지와 텍스트 겹침
   - 유형: `profile-card-overlap`
   - `data-bug-id="site030-bug02"`
   - 768px~1024px 구간에서 특정 멘토 카드 이미지가 텍스트 위로 겹친다.

3. `site030-bug03`
   - CSV 오류명: 예약 요약 상태 불일치
   - 유형: `booking-summary-state-mismatch`
   - `data-bug-id="site030-bug03"`
   - 시간 슬롯 선택 버튼은 바뀌지만 예약 요약 시간은 초기 값에 머문다.

## PPO 에이전트가 탐지해야 할 기대 행동

- 평점 값이 없는 멘토 카드에서 `undefined` 텍스트가 직접 노출되는지 확인한다.
- 태블릿 폭에서 멘토 이미지와 이름/분야 텍스트가 겹치는지 관찰한다.
- 시간 슬롯을 변경한 뒤 선택 버튼 표시와 예약 요약 시간이 서로 일치하는지 비교한다.

## 문서 안내

- `BUGS.md`: 의도된 오류 3개의 화면 위치, 원인, 탐지 포인트를 상세 기록한다.
- `TODO.md`: 생성, 검증, 배포 진행 상태 체크리스트를 기록한다.

## 배포 시 주의사항

- `npm start`는 자동으로 `npm run build`를 먼저 실행한다.
- Express는 `dist`를 정적 서빙하며 없는 asset 요청은 404를 반환한다.
- 의도된 오류는 프론트엔드 GUI/렌더링/상태/레이아웃 오류로만 유지한다.
