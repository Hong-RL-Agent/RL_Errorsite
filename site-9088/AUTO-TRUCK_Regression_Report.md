# AUTO-TRUCK Regression Report - Port 9088

프로젝트 기준 포트는 `http://localhost:9088`이며, 프론트엔드 API 호출은 모두 상대 경로 `/api/...`를 사용한다. Vite 개발 서버는 `/api`를 Spring Boot `http://localhost:8080`으로 프록시하고, Docker 환경에서는 Nginx가 같은 `/api` 경로를 `backend:8080`으로 전달한다.

## 결함 주입 매트릭스

| # | 훈련 결함 | 구현 위치 | 관찰 포인트 |
|---|---|---|---|
| 1 | 서버 응답 지연 시 타임아웃을 처리하지 않는 Long Polling | `frontend/src/services/faults.js`의 `startLongPollWithoutTimeout`, `backend/src/main/java/com/autotruck/control/ControlController.java`의 `/api/long-poll/status` | `AbortController` 없이 12초 지연 응답을 무한 대기한다. |
| 2 | 수신되는 실시간 위치 이벤트의 순서가 뒤섞여 렌더링되는 SSE 결함 | `startOutOfOrderSse`, `/api/events/location` | 클라이언트가 `sequence`를 재정렬하지 않고 도착 순서 그대로 렌더링한다. |
| 3 | 구형 브라우저에서 최신 문법 실행 시 발생하는 Polyfill 누락 크래시 | `runPolyfillCrashProbe` | `structuredClone`, `Array.prototype.at` 존재를 가정한다. |
| 4 | 네트워크 불안정 시 청크 로드 실패를 처리하지 못하는 Dynamic Import 오류 | `loadPredictiveMaintenancePanel` | `import()` 실패에 대한 `catch`, retry, fallback UI가 없다. |
| 5 | 언어팩 로딩 전까지 화면이 하얗게 멈추는 i18n 비동기 로딩 지연 | `frontend/src/i18n/I18nGate.jsx` | locale JSON 로딩 전 `null`을 반환해 첫 화면이 비어 있다. |
| 6 | 프론트와 백엔드 간 오프셋 계산 착오로 발생하는 Timezone 미스매치 | `computeTimezoneMismatch` | 서버가 이미 KST offset을 포함한 값을 보내는데 클라이언트가 9시간을 다시 더한다. |
| 7 | 연료 및 각도 계산 시 발생하는 부동소수점 연산 오류 | `computeTelemetryMath`, `/api/telemetry` | `0.1 + 0.2`, `0.1 + 0.7` 결과를 정규화하지 않고 노출한다. |
| 8 | 큰 정수 ID 값이 JSON 처리 중 소수점으로 잘리는 파손 현상 | `damageOversizeId`, `/api/telemetry` | 초대형 shipment ID를 `Number(...)`로 강제 변환한다. |
| 9 | 브라우저 정책과 충돌하여 재생이 거부되는 비디오 자동 재생 설정 | `frontend/src/App.jsx`의 `<video autoPlay ...>` | `muted`와 실패 핸들러 없이 자동 재생을 요청한다. |
| 10 | 타 도메인 리소스 로딩 시 발생하는 Canvas Tainted 보안 에러 | `drawTaintedCanvas` | 외부 이미지를 CORS 없이 canvas에 그린 후 픽셀을 읽는다. |
| 11 | 페이지 이동 후 목록 복귀 시 이전 위치를 잊어버리는 스크롤 복원 실패 | `rememberScrollOnReturn` | 목록 스크롤 상태 저장/복원 함수가 비어 있다. |

## 회귀 학습 기대 신호

- 통신 계층: timeout 누락, SSE sequence 역전, chunk failure 처리 누락
- 브라우저 호환성: polyfill 누락, autoplay 정책 충돌, canvas CORS 보안 에러
- 데이터 정합성: timezone offset 중복 적용, IEEE-754 부동소수점 오차, 큰 정수 ID 손상
- UX 상태 관리: i18n blocking blank screen, scroll restoration failure

## 격리 확인

- 고정 공개 포트: `9088`
- 프론트 개발 주소: `http://localhost:9088`
- 백엔드 CORS 허용 origin: `http://localhost:9088`
- 프론트 API 호출 규칙: `/api/...`
- Docker 공개 매핑: `9088:80`
- 이전 프로젝트 포트 범위는 런타임 설정에 포함하지 않는다.
