# HEALTH-PILL Regression Report

대상 포트: `http://localhost:9085`

## 배포 위험 시뮬레이션

1. 서버 빅뱅 배포 후 롤백 불가 상태
   - 위치: `GET /api/deployments/status`의 `bigBang`
   - 증상: `v2.9.0` 승격 후 이전 artifact가 덮여 복구할 수 없는 상태로 표시된다.

2. 카나리아 배포 오류율 오판
   - 위치: `GET /api/deployments/status`의 `canary`
   - 증상: 낮은 오류율임에도 false-positive 측정 윈도우 때문에 정상 업데이트가 중단된다.

3. Blue/Green DB 스키마 불일치
   - 위치: `GET /api/deployments/status`의 `blueGreen`
   - 증상: blue와 green 풀의 `medication_schedule` 구조 차이로 데이터 충돌 위험이 노출된다.

## 클라이언트 결함 시뮬레이션

4. SPA 라우팅 이동 시 Store 증발
   - 위치: `frontend/src/App.tsx`
   - 증상: `schedule` 외 화면으로 이동하면 `volatileStore`가 빈 값으로 재설정된다.

5. 오프라인 데이터 온라인 복귀 시 유실
   - 위치: `frontend/src/lib/faultSimulators.ts`
   - 증상: `online` 이벤트에서 오프라인 복약 큐를 replay하지 않고 삭제한다.

6. PWA 서비스 워커 무한 새로고침 루프
   - 위치: `frontend/public/sw.js`
   - 증상: `FORCE_REFRESH` 메시지가 들어오면 모든 클라이언트를 현재 URL로 다시 navigate한다.

7. LocalStorage QuotaExceededError
   - 위치: `simulateQuotaFailure`
   - 증상: 대용량 문자열을 반복 저장하여 브라우저 스토리지 할당량 초과를 유도한다.

8. IndexedDB 장시간 트랜잭션 잠금
   - 위치: `simulateIndexedDbLock`
   - 증상: 단일 readwrite 트랜잭션에서 대량 put 작업을 수행해 DB 점유 시간이 길어진다.

9. Web Worker 메시지 폭주
   - 위치: `simulateWorkerPressure`
   - 증상: 짧은 간격으로 대량 `postMessage`를 발생시켜 메인 스레드 이벤트 처리를 압박한다.

10. 무한 스크롤 DOM 노드 미정리
    - 위치: `App.tsx`의 `feedSize`
    - 증상: `DOM +` 버튼을 누를수록 기존 노드를 정리하지 않고 환자 피드 노드를 누적한다.

11. 이미지 레이지 로딩 실패
    - 위치: `App.tsx`의 `lazyBroken`
    - 증상: 기본 이미지 경로가 누락 파일을 가리켜 초기 렌더링 지연과 이미지 미노출을 만든다.

## 통신 및 격리 검증 항목

- Vite 개발 서버는 `9085` 고정 및 `strictPort: true` 설정을 사용한다.
- 프론트엔드 API 호출은 `/api/...` 상대 경로만 사용한다.
- Vite 프록시는 `/api`를 Spring Boot 백엔드로 전달한다.
- Spring Boot 전역 CORS는 `http://localhost:9085`를 허용한다.
- Docker Compose는 프론트엔드를 `9085:9085`로 노출한다.
