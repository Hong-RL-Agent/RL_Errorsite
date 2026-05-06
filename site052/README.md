# NEONFIT 프리미엄 헬스 회원권

- 사이트 이름: NEONFIT 프리미엄 헬스 회원권
- 사이트 ID: site052
- 포트 번호: 9271
- 기술 스택: Vanilla HTML, CSS, JavaScript, Express

## 실행 방법

```bash
cd site052
npm install
npm start
```

브라우저에서 `http://localhost:9271`로 접속합니다.

```bash
npm run dev
npm run build
```

## API 엔드포인트

- `GET /api/health`: 서버 상태 확인
- `GET /api/plans`: 플랜 ID, 이름, 월 가격, 연 가격, 혜택, 추천 여부 mock 데이터
- `GET /api/trainers`: 트레이너 ID, 이름, 전문 분야, 경력, 평점, 이미지 mock 데이터

## 정상 작동 기능

- `/api/plans` 데이터를 `fetch`로 받아 회원권 가격 카드 렌더링
- `/api/trainers` 데이터를 `fetch`로 받아 트레이너 카드 렌더링
- 월간/연간 결제 토글 상태 변경
- 정상 플랜 선택 버튼의 우측 sticky 요약 반영
- PT 세션 range 입력 반영
- 락커 및 수건 옵션 checkbox 반영
- 운동 프로그램 필터
- 트레이너 상세 모달 열기와 닫기
- FAQ accordion
- 무료 체험 신청 폼 입력값 미리보기 및 sticky 요약 반영
- 후기 이전/다음 버튼
- 네비게이션 섹션 이동
- 준비되지 않은 보조 버튼은 `준비중입니다.` alert 표시
- API 로딩 상태와 에러 상태 UI 표시

## 의도된 프론트엔드 오류 3개

1. `site052-bug01`: 가격 토글 불일치
   - 연간 토글을 켜도 추천 플랜인 `Performance Plus` 카드 가격만 월간 가격으로 계속 표시됩니다.
2. `site052-bug02`: 비교 테이블 깨짐
   - 데스크톱 중간 폭에서 회원권 비교표 마지막 컬럼이 컨테이너 밖으로 잘립니다.
3. `site052-bug03`: 플랜 선택 버튼 무반응
   - `Elite Coaching` 플랜의 선택 버튼만 클릭해도 우측 선택 요약이 바뀌지 않습니다.

자세한 오류 명세는 `BUGS.md`를 확인하세요. 구현 및 확인 상태는 `TODO.md`에 정리되어 있습니다.
