# FitTrack Studio (site003)

## 개요
- **사이트 이름:** FitTrack Studio
- **사이트 ID:** site003
- **포트 번호:** 9332
- **기술 스택:** Node.js, Express, Vanilla HTML/CSS/JS

## 실행 방법
```bash
cd site003
npm install
npm start
```
서버가 실행되면 브라우저에서 `http://localhost:9332` 로 접속할 수 있습니다.

## API 엔드포인트 목록
- `GET /api/health` - 서버 상태 확인
- `GET /api/workouts` - 운동 기록 조회 (쿼리 파라미터 `userId` 지원)
- `PUT /api/workouts/:id/complete` - 특정 운동 완료 처리
- `POST /api/workouts` - 새 운동 추가
- `GET /api/stats` - 통계 데이터 조회
- `GET /api/goals` - 목표 데이터 조회
- `GET /api/profile` - 프로필 정보 조회

## 정상 작동 기능 목록 (인터랙션)
1. **운동 기록 조회 및 렌더링** (초기 로드)
2. **운동 필터링** (상체/하체/전신 등)
3. **운동 완료 체크** (PUT API 호출)
4. **통계 새로고침** (GET API 호출)
5. **타겟 사용자 기록 조회** (GET API 호출, 버그 연동)
6. **새 운동 추가 폼 제출** (POST API 호출)
7. **목표 체중 저장** (클라이언트 이벤트)
8. **루틴 추천 탭 전환** (초급/중급/고급)
9. **프로필 화면 전환**
10. **프로필 데이터 로드** (GET API 호출)
11. **토스트 알림 피드백**

## 의도된 오류 (3개)
이 프로젝트는 강화학습 모델(PPO) 훈련을 위해 다음 3개의 오류를 포함하고 있습니다.
1. **site003-bug01 (DB 오류):** DB 업데이트 대상 오류 (요청 ID 무시하고 첫 번째 항목 업데이트)
2. **site003-bug02 (네트워크 오류):** 불안정한 네트워크 응답 (간헐적 503 에러 발생)
3. **site003-bug03 (보안 오류):** 권한 검증 누락 (임의의 `userId`로 타인 기록 조회 가능)

자세한 오류 정보는 `BUGS.md`를 확인하세요.
작업 진행 상태는 `TODO.md`를 참고하세요.
