# MELODY-AI Regression Report

기준 Origin은 `http://localhost`로 통일했다. Docker 실행 시 프론트엔드는 외부 `http://localhost:9063`으로 포워딩되고 `/api` 요청만 사용하며, Vite 프록시가 컨테이너 내부 백엔드 `http://backend:9063`으로 전달한다. Spring Boot는 `WebMvcConfigurer`와 Spring Security CORS를 함께 활성화해 브라우저의 Origin mismatch와 `chrome-error://chromewebdata/` 유입을 방지한다.

## 통신 무결성 설정

- Public frontend port: `9063`
- Backend container port: `9063`
- Backend host debug port: `19063`
- CORS allowed origins: `http://localhost:9063`, `http://localhost:5173`, `http://localhost:19063`
- Frame policy: `X-Frame-Options: SAMEORIGIN`
- CSP frame ancestors: `'self' http://localhost:9063 http://localhost:5173 http://localhost:19063`
- Browser call path: `/api/*`

## 결함 시뮬레이션 매트릭스

| # | 결함 | 트리거 | 구현된 가드레일 | 코드 노출 |
|---|---|---|---|---|
| 1 | 헬스 체크 폭주 자가 중단 | 초당 120회 이상 health 호출 | 토큰 버킷 제한, 프로브 분리, 연속 실패 확인 | `/api/regressions` |
| 2 | 복구 우선순위 역전 | 낮은 영향도 복구가 GPU 세션보다 선점 | 영향도와 의존성 깊이 기반 우선순위 재계산 | `/api/regressions` |
| 3 | 누적된 알림 폭주 | 동일 장애 5분간 700건 누적 | 상관관계 키 병합, digest 전환, 지수 백오프 | `/api/regressions` |
| 4 | 자동 복구 스크립트 무한 재부팅 루프 | 종료 코드 오판으로 반복 재기동 | 회로 차단기, 최대 3회 제한, 수동 승인 대기 | `/api/regressions` |
| 5 | 복구 시 자원 경합 연쇄 고갈 | 동시 복구 잡이 GPU/캐시를 점유 | 복구 세마포어, 예산 예약, 큐 격리 | `/api/regressions` |
| 6 | 외부 페이지 체류에 의한 세션 만료 | OAuth/문서 페이지에서 장시간 체류 | refresh grace window, draft checkpoint | `/api/regressions` |
| 7 | 외부 API 임시 링크 즉시 만료 | clock skew로 사전 서명 URL TTL 0 | 서버 기준 서명, skew 허용, 단회 재발급 | `/api/regressions` |
| 8 | 외부 인증 후 세션 문맥 유실 | callback state 누락 | state nonce, SameSite=Lax, context vault | `/api/regressions` |
| 9 | 델타 업데이트 바이너리 체크섬 불일치 | SHA-256 매니페스트 불일치 | 원자적 다운로드, 검증 실패 시 이전 버전 유지 | `/api/regressions` |
| 10 | 백그라운드 좀비 프로세스 핸들 점유 | 하위 프로세스 종료 후 핸들 유지 | 프로세스 그룹 종료, orphan scan, lease 만료 | `/api/regressions` |
| 11 | 가속기 드라이버 버전 불일치 성능 하락 | 런타임보다 낮은 드라이버 감지 | 드라이버 매트릭스 검사, fallback, degrade 알림 | `/api/regressions` |

## 구현 위치

- 결함 데이터 모델: `src/main/java/ai/melody/model/RegressionScenario.java`
- 결함 시뮬레이션 서비스: `src/main/java/ai/melody/service/RegressionScenarioService.java`
- API 컨트롤러: `src/main/java/ai/melody/controller/MelodyController.java`
- 프론트엔드 매트릭스 렌더링: `frontend/src/main.tsx`

## 검증 기준

1. `Origin: http://localhost:9063` 요청이 `Access-Control-Allow-Origin: http://localhost:9063`을 반환한다.
2. `/api/regressions`가 11개 결함을 반환한다.
3. 프론트엔드 코드는 직접 `http://localhost:9063`을 호출하지 않고 `/api`만 호출한다.
4. Docker Compose에서 `9063:9063`, `5173:5173` 포트 매핑과 환경 변수가 명시되어 있다.
