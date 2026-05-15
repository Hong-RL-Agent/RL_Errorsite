# PHARMA-AI Regression Report

공개 진입점은 `http://localhost:9068` 하나로 고정한다. 브라우저의 모든 API 호출은 상대 경로 `/api/...`를 사용하며, Docker 환경에서는 Nginx가 `/api` 요청을 백엔드 컨테이너로 프록시한다. Spring Boot 백엔드는 `http://localhost:9068` 출처를 전역 CORS 허용 출처로 등록한다.

## 구현된 결함 시나리오

1. 공유 워커 내 좀비 세션 상태 오염으로 인한 데이터 간섭
   - `frontend/src/workers/pharmaSharedWorker.ts`에서 동일 `sessionId` 재연결 시 이전 후보군 상태를 보존하고 `contaminated=true`로 표시한다.

2. Shared Worker 포트 미폐쇄에 따른 잔류 세션 및 메모리 유출
   - 워커의 `ports` 배열은 연결된 `MessagePort`를 제거하지 않아 잔류 포트 카운트를 재현한다.

3. 웹 워커 강제 종료 시 공유 메모리 데이터 파손
   - `force-terminate` 메시지가 `SharedArrayBuffer` 기반 `Int32Array`에 비정상 체크섬 값을 기록한다.

4. MFE 환경에서 공유 워커 세션 전환 실패 및 데이터 잔류
   - `switch-mfe` 메시지는 MFE 이름만 갱신하고 이전 후보군 데이터를 남겨 세션 잔류 상태를 만든다.

5. Early Hints 설정과 브라우저 캐시 정책 충돌로 인한 로딩 지연
   - `backend/src/main/java/com/pharmaai/api/ResearchController.java`의 fault matrix에 `early-hints-cache` 항목을 노출해 회귀 학습 입력으로 제공한다.

6. 환경별 API 속도 제한 구성 불일치 오류
   - 백엔드 텔레메트리가 `dev=240`, `prod=60`으로 불일치한 rate limit 값을 반환한다.

7. DNS TTL 불일치로 인한 환경 전파 지연 및 주소 드리프트
   - 백엔드 텔레메트리가 `dev=30s`, `prod=300s` DNS TTL 차이를 반환한다.

8. 서버 인스턴스 간 DB 커넥션 풀 비대칭 구성 오류
   - 백엔드 텔레메트리가 `instance-a=24`, `instance-b=8` 풀 크기 비대칭을 반환한다.

9. SSL/TLS 프로토콜 버전 불일치에 의한 통신 거부
   - fault matrix와 인프라 패널에 `TLSv1.3` 요구 조건을 노출해 구형 프로토콜 거부 조건을 검출하게 한다.

10. 로드 밸런서의 Sticky Session 구성 누락으로 인한 세션 유실
    - 백엔드 텔레메트리가 `sticky-session=false`를 반환하고 프론트 패널에서 경고로 표시한다.

11. 일광 절약 시간제 전이 시 타임스탬프 중복 및 예약 오류
    - fault matrix에 `dst-duplicate-timestamp`를 포함하고 서버 시간대 정보를 함께 반환해 스케줄러 회귀 조건으로 사용한다.

## 포트 및 통신 검증 기준

- 공개 URL: `http://localhost:9068`
- 프론트엔드 개발 서버: Vite `9068`, `strictPort=true`
- 브라우저 API 호출: `/api/dashboard`, `/api/simulations/trigger`
- Docker 공개 포트: `9068:9068`
- 컨테이너 내부 백엔드: `backend:8080`, 외부 직접 노출 없음
- 이전 프로젝트 포트 번호는 코드와 문서에 포함하지 않는다.
