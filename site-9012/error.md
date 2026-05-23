🏗️ Site #9012 장애 및 취약점 핵심 요약
1. Slowloris / 커넥션 독점 (Connection Hoarding)
파일: backend/server.js (/api/execute-trade 엔드포인트)

내용: 사용자가 '주문하기' 버튼을 누르면 서버가 응답을 즉시 보내지 않고 setTimeout을 통해 40~45초 동안 연결(Connection)을 유지만 하고 있습니다.

오류의 성격: CSV 리스트 7번 항목입니다. 서버가 바쁜 척하며 응답을 주지 않고 연결 통로만 점유하는 공격/장애 기법입니다.

현상: 소수의 사용자가 주문 버튼을 연타하면 서버의 모든 가용 커넥션이 소진되어, 이후에 접속하려는 다른 사용자들은 사이트 접속조차 안 되는 상태가 됩니다.

2. Nginx 리버스 프록시 설정 미비 (Inadequate Timeout Policy)
파일: nginx.conf

내용: Nginx의 proxy_read_timeout과 proxy_connect_timeout이 45초라는 비정상적으로 긴 시간으로 설정되어 있습니다.

오류의 성격: 인프라 설정 오류(Security/Infrastructure Misconfiguration)입니다. 보통의 서비스라면 일정 시간(예: 5초) 내에 응답이 없을 경우 Nginx가 연결을 강제로 끊어 자원을 회수해야 하지만, 여기선 끝까지 기다려주며 자원 낭비를 방치합니다.

3. 커넥션 풀 고갈 및 서비스 거부 (Connection Pool Exhaustion)
내용: 도커 컨테이너와 Node.js 서버가 수용할 수 있는 동시 접속자 수에는 한계가 있는데, 종료되지 않은 연결들이 쌓이면서 **'신규 연결 요청'**을 받을 수 없는 상태에 빠집니다.

현상: 브라우저 개발자 도구의 Network 탭에서 보면 특정 요청이 계속 Pending 상태로 머물다가 결국 504 Gateway Timeout을 뱉게 됩니다.