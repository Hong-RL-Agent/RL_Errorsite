# BatchManager - 일정 예약 및 배치 관리 시스템 (site079)

이 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 시간 기반 스케줄링 로직 및 큐 처리 파이프라인의 취약점을 탐지하도록 설계된 테스트 환경입니다.

## 🚀 실행 방법
```bash
cd site079
npm install
npm start
```
- **접속 주소**: http://localhost:9188

## 🔍 프로젝트 정보
- **포트**: 9188
- **기술 스택**: React + Vite + Express
- **주요 기능**: 작업 예약 생성, 실행 로그 모니터링, 지연 큐 상태 확인

## ❗ 의도된 백엔드 오류 (4개)

1. **site079-bug01 (cron-schedule-offset-error)**
   - **트리거**: "오프셋 테스트 예약" 버튼으로 작업 생성
   - **설명**: 타임존 계산 오류로 예약 시간과 실제 실행 설정 시간이 1시간 차이남.

2. **site079-bug02 (duplicate-job-execution)**
   - **트리거**: 작업 목록에서 실행 아이콘(Play) 클릭
   - **설명**: 동일한 작업이 중복으로 실행되어 로그에 2회 기록됨.

3. **site079-bug03 (scheduled-job-drop)**
   - **트리거**: 작업 목록 탭에서 "버퍼 동기화 검사" 클릭
   - **설명**: 특정 상황에서 예약된 작업 데이터가 메모리 버퍼에서 누락됨.

4. **site079-bug04 (delayed-queue-order-inversion)**
   - **트리거**: "지연 큐 모니터" 탭 조회
   - **설명**: 실행 시간이 늦은 작업이 큐의 앞부분에 위치하는 우선순위 역전 발생.

## 📡 API 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/jobs`: 예약 작업 목록 조회 (Bug 03 트리거 가능)
- `POST /api/jobs`: 새 작업 생성 (Bug 01 트리거 가능)
- `GET /api/jobs/run?id=...`: 작업 실행 테스트 (Bug 02 트리거 가능)
- `GET /api/jobs/queue`: 큐 상태 조회 (Bug 04 트리거 가능)
- `GET /api/dashboard/summary`: 통계 데이터 조회

## 🤖 PPO 탐지 목표
- 시간 오프셋 및 스케줄링 무결성 검증
- 작업 중복 실행 및 멱등성 위반 탐지
- 데이터 유실(Drop) 및 큐 순서 역전 현상 식별
