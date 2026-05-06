# MetroYellow Airport Ride

- 사이트 이름: MetroYellow Airport Ride
- 사이트 ID: site039
- 포트 번호: 9258
- 기술 스택: React, Vite, Express, lucide-react

## 실행 방법

```bash
cd site039
npm install
npm run build
npm start
```

브라우저에서 `http://localhost:9258`로 접속합니다.

## API 엔드포인트

- `GET /api/health`: 서버 상태 확인
- `GET /api/vehicles`: 차량 타입, 좌석 수, 기본 요금, 예상 도착 시간, 이미지 데이터 반환
- `GET /api/fare-estimate`: 거리, 예상 시간, 기본 요금, 할증, 총액 반환

## 정상 작동 기능

- 출발지 입력 반영
- 도착지 입력 반영
- 상단 검색 입력과 본문 예약 폼 state 동기화
- 출발지/도착지 교체
- 빠른 경로 선택
- 예약 시간 선택
- 차량 타입 선택
- 승객 수 증감
- 수하물 수 증감
- 왕복 예약 토글
- 수하물 지원 토글
- 항공편 번호 입력
- 요금 상세 모달 열기/닫기
- 차량 및 요금 API 로딩/에러 UI
- 후기 필터 전환
- 구현 대상이 아닌 버튼과 링크는 `준비중입니다.` alert 표시

## 의도된 프론트엔드 오류 3개

1. `site039-bug01` - 예상요금 상태 불일치: 차량 타입 변경 후 우측 예약 요약 예상 요금이 이전 차량 기준으로 남음
2. `site039-bug02` - 지도 카드가 컨트롤 덮음: 지도 mock 패널이 예약 시간 선택 컨트롤 일부를 덮어 클릭을 방해함
3. `site039-bug03` - 호출 버튼 무반응: `예약 호출하기` 버튼 클릭 후 완료 상태로 이동하지 않음

자세한 오류 명세는 `BUGS.md`, 확인 작업 목록은 `TODO.md`를 참고합니다.
