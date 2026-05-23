1. 디렉토리 리스팅 활성화 (Security Misconfiguration)
파일: nginx.conf

내용: autoindex on; 설정으로 인해 서버의 파일 목록이 외부에 노출됩니다.

위험: 공격자가 서버 구조를 파악하고 백업 파일이나 설정 파일을 탈취할 수 있는 통로가 됩니다.

2. 기본 인덱스 파일 경로 미스매치 (Entry Point Error)
파일: nginx.conf

내용: Nginx는 landing.html을 찾으려 하지만, 실제 파일은 home.html로 저장되어 있습니다.

증상: 정상적인 메인 화면이 뜨지 않고 파일 목록이 뜨는 직접적인 원인이 됩니다.

3. 민감한 파일 노출 (Sensitive Data Exposure)
위치: frontend/dist/

내용: .env.backup, db_schema.sql 등 운영 환경에서 절대 노출되어서는 안 될 파일들이 디렉토리 리스팅을 통해 보입니다.

학습 목표: 에이전트는 "화면이 안 뜬다"는 불평뿐만 아니라, **"보안상 위험한 파일들이 노출되고 있다"**는 경고를 할 수 있어야 합니다.