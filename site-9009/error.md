🔍 Site #9009 포함 오류 정리
종속성 혼란 (Dependency Confusion):

내부용 패키지(jaws-logger-lib) 대신 외부 공개 저장소(npm)의 이름만 같은 패키지가 설치된 상황입니다.

에이전트는 Using MALICIOUS_SHADOW_PACKAGE라는 텍스트를 통해 출처가 오염되었음을 인지해야 합니다.

공급망 보안 취약점 (Supply Chain Vulnerability):

package-lock.json이나 npmrc 설정 미비로 인해 발생하며, 코드 로직 자체에는 에러가 없어 탐지가 매우 어렵습니다.

데이터 유출 (Data Exfiltration):

백엔드 로그가 로컬에 남지 않고 EXTERNAL_ATTACKER_SERVER로 전송되고 있습니다.