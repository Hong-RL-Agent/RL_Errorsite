# StudyRoom Booking (site007)

## 개요
- **사이트 이름:** StudyRoom Booking
- **사이트 ID:** site007
- **포트 번호:** 9336
- **기술 스택:** Node.js, Express, Vanilla HTML/CSS/JS

## 실행 방법
```bash
cd site007
npm install
npm start
```
서버가 실행되면 브라우저에서 `http://localhost:9336` 으로 접속할 수 있습니다.

## API 엔드포인트 목록
- `GET /api/health` - 서버 상태 확인
- `GET /api/rooms` - 스터디룸 목록 조회
- `GET /api/timeslots` - 특정 날짜/룸의 예약 가능 시간표 조회
- `POST /api/bookings` - 예약 생성
- `GET /api/bookings/my` - 내 예약 내역 조회
- `POST /api/bookings/:id/cancel` - 예약 취소
- `GET /api/bookings/all` - 전체 예약 내역 조회 (관리자용)
- `GET /api/notices` - 공지사항 목록 조회

## 정상 작동 기능 목록 (인터랙션)
1. **스터디룸 목록 조회 및 선택**
2. **스터디룸 타입(개인실/미팅룸 등) 필터링**
3. **예약 날짜 선택 (Date Picker)**
4. **해당 룸과 날짜에 맞는 시간표 동적 렌더링 및 선택**
5. **예약 폼 제출 및 확정 (POST API)**
6. **내 예약 내역 조회 및 리스트 렌더링**
7. **기존 예약 취소 및 상태 변경 업데이트**
8. **네비게이션 탭 전환 (예약하기 / 내 예약 / 이용 안내)**
9. **관리자 전체 예약 조회 모의 테스트 기능**
10. **공지사항 목록 불러오기 (CORS 처리)**

## 의도된 오류 (3개)
이 프로젝트는 강화학습 모델(PPO) 훈련을 위해 다음 3개의 오류를 포함하고 있습니다.
1. **site007-bug01 (DB 오류):** DB 동시성 충돌 (동일 시간대 예약 중복 검증 누락)
2. **site007-bug02 (네트워크 오류):** CORS 설정 오류 (존재하지 않는 도메인 허용으로 브라우저 차단)
3. **site007-bug03 (보안 오류):** 관리자 권한 검증 누락 (일반 사용자도 전체 예약 접근 가능)

자세한 오류 정보는 `BUGS.md`를 확인하세요.
작업 진행 상태는 `TODO.md`를 참고하세요.
