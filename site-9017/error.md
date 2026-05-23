Site #9017 포함 오류 정리
연결/세션 유기 (Abandoned Connection/Session):

사용자가 로그아웃을 하면 클라이언트는 세션을 종료했다고 믿지만, 백엔드의 serverConnectionHandles는 줄어들지 않습니다.

소켓 핸들 누수 (Socket Handle Leak):

로그인을 할 때마다 새로운 연결 핸들이 생성되고, 로그아웃 시 반납되지 않습니다. 이는 결국 서버의 최대 파일 디스크립터(File Descriptor) 한도에 도달하게 하여 서버를 뻗게 만듭니다.

에이전트 훈련 포인트:

에이전트는 하단의 Diagnostics 섹션에서 "Authenticated Sessions"와 "Unclosed Socket Handles"의 숫자가 불일치하는 것을 보고, 로그아웃 로직의 결함을 찾아내야 합니다.