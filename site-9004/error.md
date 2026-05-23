₿ Site #9004 장애 요소 요약
1. 환경 변수 주입 누락 (Root Cause)
파일: docker-compose.yml

내용: 필수 보안 키인 CRYPTO_SECRET_KEY 항목이 주석 처리되어 컨테이너에 전달되지 않습니다.

에러의 성격: 인프라 배포 단계에서 발생하는 설정 누락(Configuration Drift) 오류입니다.

2. 하드 실패 로직 (Fail-Fast 전략)
파일: backend/server.js

내용: 서버 기동 직후 환경 변수를 검사하고, 값이 없으면 process.exit(1)을 실행하여 프로세스를 강제로 종료합니다.

오류 현상: 백엔드 컨테이너가 'Up' 상태를 유지하지 못하고 계속 Exited (1) 상태로 남게 됩니다. 에이전트는 여기서 단순히 서버가 느린 게 아니라 아예 존재하지 않음을 인지해야 합니다.

3. 서비스 도달 불능 (Frontend Symptom)
파일: frontend/src/App.jsx

내용: 백엔드가 죽어있으므로 fetch('/api/wallet') 요청이 ECONNREFUSED(연결 거부) 에러를 발생시킵니다.

사용자 경험: 화면에는 데이터 대신 **"⚠️ 보안 노드 접속 불가"**라는 경고만 출력됩니다.