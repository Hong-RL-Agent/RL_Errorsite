# StayMeet (C-08) — 예약 관리 플랫폼 (Validation 환경)

StayMeet은 DQN 기반 웹 오류 탐지/재현 시스템의 **Validation 환경**으로 제작된 스마트 공간 및 숙소 통합 예약 관리 웹 애플리케이션입니다.

## 1. 포트 구성
- **Frontend**: `http://localhost:5180`
- **Backend**: `http://localhost:5007`

## 2. 기술 스택
- **Frontend**: React, Vite, Lucide-React, Vanilla CSS (Botanical Sage & Ceramic Sand 테마)
- **Backend**: Express.js, SQLite3 (`backend/data/staymeet.db`), CORS, Morgan

## 3. 검증 전략 및 구현된 버그 요약
| Bug ID | 전략 | 명칭 | 확인 방식 |
|---|---|---|---|
| `C-08-439` | ACTION_REPLAY | Double Booking Collision | 14:00~15:00 중복 예약 시 Network 201 + 타임라인 중복 DOM |
| `C-08-158` | ACTION_REPLAY | Timezone Shift Bug | 10:00 선택 후 저장 시 01:00 변환 오류 |
| `C-08-625` | SEQUENCE_REPLAY | Seat Option Multiplier Failure | 3명 + VIP 좌석 선택 시 옵션 단가 미곱셈 (flat 10,000원 추가) |
| `C-08-434` | SEQUENCE_REPLAY | Partial Cancel Calculation Error | 다중 예약 중 1개 부분 취소 시 환불 예상 금액 0원 |
| `C-08-1971` | STATE_REVISIT | Cancel Persistence Bug | 취소 직후 '취소' → 화면 이탈 후 재방문 시 '예약 확정' 부활 |

## 4. 실행 및 테스트
```bash
# Backend 실행 (Port 5007)
cd backend
npm install
node server.js

# Frontend 실행 (Port 5180)
cd ../frontend
npm install
npm run dev

# 자동화 버그 검증 스위트 실행
cd ../backend
node test_bugs.js
```
