🔍 Site #9008 포함 오류 정리
클라우드 스토리지 공용 노출 (Public Bucket Exposure):

원래는 API를 통해서만 접근해야 할 /storage/ 경로가 Nginx 설정을 통해 URL 직접 접근이 가능해졌습니다.

디렉토리 리스팅 활성화 (Insecure Directory Listing):

9005번과 유사하게 autoindex on이 적용되어 있어, 파일 이름을 몰라도 어떤 기밀문서가 있는지 목록을 한눈에 볼 수 있습니다.

접근 제어 메커니즘 부재 (No Access Control):

IP 제한이나 토큰 인증 없이 누구나 /storage/ 주소를 입력하면 사내 자산을 다운로드할 수 있는 상태입니다.