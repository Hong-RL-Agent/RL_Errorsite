# ORBIT-HOTEL 9047

J.A.W.S PPO 기반 AI QA 에이전트 훈련용 의도적 결함 웹사이트입니다.

## 실행

```powershell
docker compose up --build
```

접속: `http://localhost:9047`

## 구성

- `backend`: Spring Boot 3, Java 17, H2, WebSocket
- `frontend`: React, Vite, TypeScript, Tailwind v4
- `nginx`: 정적 프론트엔드 서빙 및 `/api`, `/ws` 리버스 프록시

## 포함된 의도적 결함

이 저장소는 보안/품질 QA 훈련을 위해 취약한 동작을 의도적으로 포함합니다.

1. 무중력실 상태 로그 조회 시 static List 누적 메모리 누수
2. 신분증 업로드 확장자 우회
3. 특정 음수 중력 보정값 입력 시 무한 재귀
4. 예약 결제 실패 시 트랜잭션 롤백 누락
5. 예약 확인 페이지 DOM XSS
6. 예약 확정 버튼 중복 제출 방지 누락
7. 오래된 취약 라이브러리 포함
8. 비밀번호 복잡도 검증 없음
9. OAuth state 검증 누락
10. HTTP 통신 허용
11. WebSocket Origin 검증 누락
