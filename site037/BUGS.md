# BUGS - site037

## site037-bug01
- **type**: brute-force-vulnerability
- **API**: `POST /api/auth/login`
- **symptom**: 반복적인 로그인 실패 요청에도 불구하고 429(Too Many Requests) 차단이 발생하지 않음
- **description**: 로그인 시도 횟수 제한 로직 누락

## site037-bug02
- **type**: privilege-escalation
- **API**: `POST /api/auth/login`
- **symptom**: 요청 페일로드에 `role: "admin"`을 추가하면 서버에서 관리자 권한을 부여함
- **description**: 서버 측 권한 할당 로직의 클라이언트 의존성 문제

## site037-bug03
- **type**: insecure-direct-object-reference
- **API**: `GET /api/checklists/:id`
- **symptom**: 세션 정보와 무관하게 특정 ID 값을 가진 모든 체크리스트 조회가 가능함
- **description**: 리소스 접근 시 소유권 확인(Authorization) 로직 누락

## site037-bug04
- **type**: missing-auth
- **API**: `POST /api/checklists`, `DELETE /api/checklists/:id`
- **symptom**: 로그인하지 않은 상태에서도 체크리스트를 생성하거나 삭제할 수 있음
- **description**: 중요 데이터 변경 API에 대한 인증 필터 누락
