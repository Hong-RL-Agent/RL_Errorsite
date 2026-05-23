☁️ Port 9033: 클라우드 및 CI/CD 결함 (Cloud & CI/CD)클라우드 설정 
오류와 배포 파이프라인의 보안 허점을 탐색하는 환경입니다.
Index 617 (Cloud Metadata Theft): 클라우드 인프라의 IMDSv1 방식을 흉내 내어 
$169.254.169.254$ 경로를 통해 서버의 자격증명(Credentials) 정보가 평문으로 노출되도록 설정합니다.

Index 621 (CI/CD Secret Exposure): 시스템의 배포 로그 출력 컴포넌트 내에 SECRET_KEY와 같은 민감한 환경 변수가 마스킹 없이 그대로 기록되도록 유도합니다.

Index 612 (Cache Inconsistency): 응답 헤더의 max-age를 과도하게 길게 설정하여, 서버의 결함이 해결된 후에도 브라우저나 CDN에 이전의 에러 페이지가 계속 남아있는 캐시 고착 현상을 재현합니다.

Index 614 (Service Worker Stale): 서비스 워커의 버전 갱신 로직을 무력화하여 클라이언트가 구버전의 스크립트를 계속 실행하게 함으로써, 최신 API와의 통신 규격 충돌을 일으킵니다.