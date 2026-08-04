# site070 — RoomBook Pro (회의실 예약 웹사이트)

PPO 강화학습 모델의 프론트엔드 GUI 오류 탐지 학습 데이터용 웹사이트입니다.

---

## 기본 정보

| 항목 | 내용 |
|------|------|
| 사이트 ID | site070 |
| 사이트 이름 | RoomBook Pro |
| 포트 | 9289 |
| 기술 스택 | Vanilla HTML + CSS + JavaScript + Express |
| 주제 | 공유오피스/회사 회의실 예약 데스크톱 웹사이트 |

---

## 실행 방법

```bash
cd site070
npm install
npm start
```

브라우저에서 http://localhost:9289 로 접속합니다.

---

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/rooms` | 회의실 목록 (6개 mock 데이터) |
| GET | `/api/time-slots?roomId=&date=` | 시간 슬롯 목록 (10개, 중복 없음) |

---

## 정상 작동 기능

- 날짜 선택 (hero 날짜 입력 / 캘린더 날짜 클릭)
- 최소 인원 필터 (셀렉트박스)
- 장비 필터 체크박스 (프로젝터, 화상회의, 화이트보드, 사운드시스템)
- 필터 초기화
- 회의실 카드 상세보기 모달 열기/닫기
- 회의실 예약하기 버튼 (특정 회의실 제외 → Bug03)
- 예약 캘린더 이전/다음 달 이동
- 예약 캘린더 날짜 선택
- 시간 슬롯 선택
- 예약 요약 패널 접기/펼치기
- 예약 확정 (alert)
- 선택 초기화
- 네비게이션 섹션 스크롤 이동
- API 로딩 스피너 및 에러 재시도 UI
- 미구현 기능 클릭 시 "준비중입니다." alert

---

## 의도된 프론트엔드 GUI 오류 (3개)

### Bug01 — 시간 슬롯 중복 표시
- **type**: `duplicate-time-slot-display`
- **위치**: 예약 일정 선택 > 시간 슬롯 패널
- **selector**: `[data-bug-id="site070-bug01"]`
- **증상**: 11:00 – 12:00 시간 슬롯이 목록 맨 아래에 한 번 더 표시됨
- **원인**: `app.js renderTimeSlots()`에서 `slots[2]`를 추가로 append

### Bug02 — 달력 grid overflow
- **type**: `booking-calendar-grid-overflow`
- **위치**: 예약 일정 선택 > 예약 캘린더
- **selector**: `[data-bug-id="site070-bug02"]`
- **증상**: 캘린더 날짜 셀이 고정 px 폭(148px×7=1036px)으로 컨테이너를 초과하여 우측으로 넘침
- **원인**: `styles.css .calendar-grid`에서 `repeat(7, 148px)` 고정 폭, overflow 처리 누락

### Bug03 — 예약 버튼 무반응
- **type**: `meeting-room-book-button-no-response`
- **위치**: 회의실 카드 그리드 > 넥스트 라운지 카드
- **selector**: `[data-bug-id="site070-bug03"]`
- **증상**: 넥스트 라운지(room-03) "예약하기" 버튼 클릭 시 아무 반응 없음
- **원인**: `app.js renderRoomCards()`에서 `room-03` 버튼에 click listener를 연결하지 않음

---

## 관련 문서

- 오류 상세 명세: [BUGS.md](./BUGS.md)
- 구현 체크리스트: [TODO.md](./TODO.md)
