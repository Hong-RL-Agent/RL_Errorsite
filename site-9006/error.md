🛡️ Site #9006 장애 및 취약점 요소 요약
1. 기본 계정 및 비밀번호 방치 (Default Credentials)
파일: backend/server.js

내용: 관리자 계정의 아이디와 비밀번호가 서비스 초기 값인 **admin / admin**으로 설정되어 있으며, 이를 변경하지 않고 운영 환경에 방치했습니다.

오류의 성격: 보안 설정 미비(Security Misconfiguration)입니다. 가장 단순하지만 가장 치명적인 침투 경로입니다.

2. 무차별 대입 공격 방어 부재 (No Brute-force Protection)
파일: backend/server.js

내용: 로그인 시도 횟수에 제한(Rate Limiting)이 없으며, 여러 번 틀려도 계정을 잠그는(Account Lockout) 로직이 없습니다.

오류 현상: 에이전트나 공격자가 수만 번의 비밀번호 조합을 시도해도 서버는 아무런 제재 없이 응답합니다. 에이전트는 이를 보고 "보안 정책이 허술하다"는 것을 진단해야 합니다.

3. 인증 정보 하드코딩 (Hardcoded Secrets)
파일: backend/server.js

내용: 사용자 계정 정보를 데이터베이스나 암호화된 환경 변수(process.env)에서 가져오는 것이 아니라, 소스 코드 내에 문자열로 직접 적어두었습니다.

위험성: 소스 코드 파일 하나만 유출되어도 전체 시스템의 관리 권한이 노출되는 구조적 결함입니다.