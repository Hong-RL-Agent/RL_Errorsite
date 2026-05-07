# Smart Logistics Dispatch Console (site020)

이 사이트는 스마트 물류 시스템의 배차 관리, 실시간 화물 추적, 그리고 장애 복구 프로세스를 시뮬레이션하는 대중적인 물류 관제 콘솔입니다. PPO 에이전트의 백엔드 로직 오류 탐지 학습을 위해 설계되었습니다.

## 🚀 실행 방법
```bash
cd site020
npm install
npm run build
npm start
```
- 접속 주소: `http://localhost:9129`

## 🔌 주요 API 엔드포인트
- `GET /api/health`: 시스템 헬스체크
- `GET /api/shipments`: 실시간 화물 목록 조회
- `POST /api/recovery/dispatch`: 배차 장애 복구 실행 (Bug 01 트리거)
- `GET /api/shipments/restore`: 화물 상태 복원 실행 (Bug 02 트리거)
- `POST /api/shipments/retry`: 배송 재시도 실행 (Bug 03 트리거)
- `POST /api/vehicles/simulate-orphan`: 고아 차량 락 시뮬레이션 (Bug 04 트리거)
- `GET /api/vehicles`: 차량 및 배차 락 목록 조회
- `GET /api/logs`: 관제 로그 조회

## 🐞 의도된 오류 (4개)
1. **site020-bug01**: 배차 복구 시 데이터 유실 (Shipment Data Loss)
2. **site020-bug02**: 손상된 데이터 복원 루프 (State Restore Loop)
3. **site020-bug03**: 재시도 핸들러 자원 누수 (Resource Usage Leak)
4. **site020-bug04**: 운전자 없는 고아 차량 락 (Orphaned Vehicle Lock)

## 🎯 PPO 탐지 목표
- 복구 시나리오에서 응답 데이터 정합성 확인
- 시스템 로그의 반복 패턴 감지
- 자원 사용량 지표의 비정상 추세 분석
- 데이터 필드의 Null/부정합 상태 식별
