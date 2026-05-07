# StreamMaster 2026 - 영상 스트리밍 테스트 플랫폼 (site081)

이 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 비디오 스트리밍 프로토콜의 결함, 데이터 무결성 손실, 그리고 비정상적 연결 종료를 탐지하도록 설계된 고정밀 테스트 환경입니다.

## 🚀 실행 방법
```bash
cd site081
npm install
npm start
```
- **접속 주소**: http://localhost:9190

## 🔍 프로젝트 정보
- **포트**: 9190
- **기술 스택**: React + Vite + Express
- **주요 기능**: 동영상 목록 조회, 가상 플레이어 제어(Seek), 실시간 버퍼 모니터링, 스트리밍 메타데이터 분석

## ❗ 의도된 백엔드 오류 (4개)

1. **site081-bug01 (range-offset-miscalculation)**
   - **트리거**: 플레이어 타임라인 "구간 점프(Seek)" 요청 시
   - **설명**: 요청한 바이트 오프셋과 다른 데이터를 반환하여 영상 싱크가 어긋남.
   - **Data-Bug-Id**: `site081-bug01`

2. **site081-bug02 (chunk-boundary-loss)**
   - **트리거**: "자동 화질 최적화" 버튼 클릭
   - **설명**: 연속된 데이터 청크 전송 중 일부 바이트를 누락시켜 영상이 깨짐.
   - **Data-Bug-Id**: `site081-bug02`

3. **site081-bug03 (partial-length-mismatch)**
   - **트리거**: "오프라인 영상 다운로드" 버튼 클릭
   - **설명**: `Content-Length` 헤더와 실제 바디 데이터의 길이가 달라 전송 지연 또는 끊김 유발.
   - **Data-Bug-Id**: `site081-bug03`

4. **site081-bug04 (premature-stream-termination)**
   - **트리거**: "플레이어 캐시 초기화" 클릭
   - **설명**: 데이터 전송이 완료되지 않은 상태에서 서버가 강제로 소켓을 종료함.
   - **Data-Bug-Id**: `site081-bug04`

## 📡 API 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/videos`: 영상 목록 반환
- `GET /api/video/:id`: 개별 영상 메타데이터 (시간 등)
- `GET /api/video/stream`: 비디오 청크 스트리밍 (Bug 트리거 가능)
- `GET /api/dashboard/summary`: 통계 정보 요약
- `GET /api/logs`: 시스템 통신 로그

## 🤖 PPO 탐지 목표
- `Range` 헤더에 기반한 부분 데이터 요청의 정확성 검증
- 스트리밍 데이터의 바이트 연속성(Continuity) 확인
- HTTP 응답 헤더와 페이로드의 정합성 체크
- 비정상적인 스트림 종료(TCP Reset 등) 패턴 식별
