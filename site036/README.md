# Northstar Cloud Landing

- 사이트 이름: Northstar Cloud
- 사이트 ID: site036
- 포트 번호: 9255
- 기술 스택: React, Vite, Express

## 실행 방법

```bash
cd site036
npm install
npm run build
npm start
```

브라우저에서 `http://localhost:9255`로 접속합니다.

## API 엔드포인트

- `GET /api/health`: 서비스 상태 확인
- `GET /api/features`: 기능 이름, 설명, 아이콘, 카테고리 mock 데이터
- `GET /api/testimonials`: 고객사명, 후기, 담당자, 로고 mock 데이터

## 정상 작동 기능

- FAQ accordion 열기/닫기
- 가격 월간/연간 토글
- 데모 요청 폼 입력값 실시간 미리보기
- 데모 요청 폼 제출 상태 표시
- 기능 탭 전환
- 고객 후기 carousel 이전/다음 이동
- API 로딩 상태 UI
- API 에러 상태 UI
- 상단 데모 요청 버튼의 폼 이동
- CTA 섹션 데모 예약 버튼의 폼 이동
- 준비 중인 메뉴와 버튼의 alert 안내

## 의도된 프론트엔드 오류 3개

- `site036-bug01`: 고객 로고 중복 렌더링
- `site036-bug02`: CTA 섹션 겹침
- `site036-bug03`: hero 데모 요청 버튼 무반응

상세 오류 정보는 `BUGS.md`에 있고, 확인 내역은 `TODO.md`에 정리되어 있습니다.
