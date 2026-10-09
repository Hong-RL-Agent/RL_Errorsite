# PulseForm (C-09) — 온라인 설문 & 리서치 플랫폼 (Unseen Test 환경)

PulseForm은 DQN 기반 웹 오류 탐지/재현 시스템의 **Unseen Test 전용 환경**으로 제작된 차세대 설문 및 리서치 웹 애플리케이션입니다.

## 1. 포트 구성
- **Frontend**: `http://localhost:5181`
- **Backend**: `http://localhost:5008`

## 2. 기술 스택
- **Frontend**: React, Vite, Lucide-React, Vanilla CSS (Electric Indigo & Editorial Dark 테마)
- **Backend**: Express.js, SQLite3 (`backend/data/pulseform.db`), CORS, Morgan

## 3. 검증 전략 및 구현된 버그 요약
| Bug ID | 전략 | 명칭 | 확인 방식 |
|---|---|---|---|
| `C-09-821` | SEQUENCE_REPLAY | Survey Question Branching Bug | Q1 '아니오'(score=1) 선택 시 Q3가 아닌 Q2로 잘못 분기 |
| `C-09-868` | ACTION_REPLAY | Matrix Choice Submission Drop | Q5 3점 '보통' 선택 시 Enum 불일치(NORMAL vs AVERAGE)로 Network 400 Bad Request |
| `C-09-1656` | SEQUENCE_REPLAY | Survey Multi-step Back Bug | 4단계 텍스트 입력 후 5단계 이동 → [이전 문항] 복귀 시 textarea 값 소실 |
| `C-09-014` | STATE_REVISIT | Survey Response Counter Inconsistency | 설문 제출 후 통계 대시보드 진입 시 총 응답자(101명)와 문항별 합계(100명) 불일치 |
| `C-09-1855` | ACTION_REPLAY | Survey Submit Freeze | 필수값 누락 상태에서 버튼 연속 클릭 시 UI 입력 Freeze (추가 DOM 반응 불가) |

## 4. 실행 및 테스트
```bash
# Backend 실행 (Port 5008)
cd backend
npm install
node server.js

# Frontend 실행 (Port 5181)
cd ../frontend
npm install
npm run dev

# 자동화 버그 검증 스위트 실행
cd ../backend
node test_bugs.js
```
