🌐 Port 9032: 네트워크 및 프로토콜 결함 (Network & Protocol)
네트워크의 불확실성과 통신 규격의 허점을 탐색하는 환경입니다.

Index 40 (Packet Loss & Timeout): 백엔드에서 의도적으로 5초간 응답을 지연시키고, Nginx에서는 타임아웃을 1초로 짧게 설정하여 충돌을 유도합니다. 결과적으로 브라우저에는 504 Gateway Timeout 에러가 발생합니다.

Index 32 (SSL Certificate Expiry): 실제 인증서 장애를 모사하기 위해 API 응답 데이터 중 sslStatus 필드에 EXPIRED_CERT라는 값을 강제로 주입하여 보안 경고 상황을 만듭니다.

Index 41 (Protocol Anomaly): 최신 규격 대신 HTTP/1.1을 강제로 사용하게 하거나 헤더를 파편화하여 통신 간의 지격(Jitter)과 성능 저하를 시뮬레이션합니다.

Index 24 (Trace-ID Context Loss): 분산 추적에 필수적인 X-Trace-ID 헤더를 약 20%의 확률로 누락시켜, 노드 간의 데이터 연결 고리가 끊기는 ERR_MISSING_HEADER 상황을 유도합니다.