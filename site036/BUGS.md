# BUGS - site036

## site036-bug01
- **type**: credential-management-error
- **API**: `POST /api/auth/login`
- **symptom**: 틀린 비밀번호를 입력해도 "user1"으로 로그인 성공
- **description**: 서버 측 비밀번호 검증 로직이 생략됨

## site036-bug02
- **type**: session-fixation-hijacking
- **API**: `GET /api/session`
- **symptom**: 로그인 전과 후의 세션 ID가 동일함
- **description**: 인증 단계에서 세션 재생성(Session Regeneration) 누락으로 인한 세션 고정 취약점

## site036-bug03
- **type**: insufficient-logout
- **API**: `GET /api/notes`
- **symptom**: 로그아웃 후에도 "My Notes" 탭에서 기록이 정상적으로 조회됨
- **description**: 로그아웃 처리 시 서버 세션 파기 누락으로 인한 세션 유지 취약점
