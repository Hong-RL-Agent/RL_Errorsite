# WorkGrid (C-10) — 엔터프라이즈 프로젝트 관리 플랫폼 (최종 Unseen Test 환경)

WorkGrid는 DQN 기반 웹 오류 탐지/재현 시스템의 **최종 Unseen Test 환경**으로 제작된 엔터프라이즈 프로젝트 관리 & 애자일 협업 플랫폼입니다.

## 1. 포트 구성
- **Frontend**: `http://localhost:5182`
- **Backend**: `http://localhost:5009`

## 2. 기술 스택
- **Frontend**: React, Vite, Lucide-React, Vanilla CSS (Enterprise Slate & Cyan 테마)
- **Backend**: Express.js, SQLite3 (`backend/data/workgrid.db`), CORS, Morgan

## 3. 검증 전략 및 구현된 버그 요약
| Bug ID | 전략 | 명칭 | 확인 방식 |
|---|---|---|---|
| `C-10-057` | ACTION_REPLAY | Milestone Delete Cascade Failure | M-01 마일스톤 삭제 후 이슈 트래커 진입 시 500 에러 및 Error Boundary Fallback |
| `C-10-786` | ACTION_REPLAY | Project Member Invitation Cross-leak | P-101에서 멤버 초대 시 stale 참조로 P-102에 전송되어 현재 멤버 수 미변경 |
| `C-10-180` | STATE_REVISIT | Filter Tag State Persistence Bug | '내 이슈'(6개) 필터 후 모달 열고 닫으면 필터 비활성화되어 24개로 복원 |
| `C-10-1445` | ACTION_REPLAY | Sprint Due-date Off-by-one Bug | 스프린트 종료일 2026-10-31 입력 시 2026-10-30으로 변환되어 저장/표시 |
| `C-10-1874` | ACTION_REPLAY | Dynamic Kanban Hydration Mismatch | 칸반 보드 진입 직후 [수정] 클릭 시 하이드레이션 불일치로 DOM 무반응 |

## 4. 실행 및 테스트
```bash
# Backend 실행 (Port 5009)
cd backend
npm install
node server.js

# Frontend 실행 (Port 5182)
cd ../frontend
npm install
npm run dev

# 자동화 버그 검증 스위트 실행
cd ../backend
node test_bugs.js
```
