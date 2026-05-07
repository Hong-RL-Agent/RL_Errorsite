# BUGS site064

### site064-bug01
- **유형**: mime-type-spoof-acceptance
- **한국어 유형**: MIME 타입 스푸핑 허용
- **API**: `/api/upload`
- **증상**: 파일 확장자만 보고 타입을 판단하여 위장된 파일(exe -> jpg) 업로드 허용.

### site064-bug02
- **유형**: file-size-validation-order-error
- **한국어 유형**: 파일 크기 검증 순서 오류
- **API**: `/api/upload`
- **증상**: 파일을 먼저 저장한 후 크기를 검증하여, 업로드 실패 응답 후에도 파일이 서버에 남음.

### site064-bug03
- **유형**: filename-normalization-collision
- **한국어 유형**: 파일명 정규화 충돌
- **API**: `/api/upload`
- **증상**: 공백 제거 및 소문자 변환 과정에서 다른 파일명이 동일해져 덮어쓰기 발생.

### site064-bug04
- **유형**: metadata-write-delay-desync
- **한국어 유형**: 메타데이터 기록 지연 불일치
- **API**: `/api/files`
- **증상**: 파일 업로드 후 메타데이터 저장이 지연되어 목록 조회 시 정보 누락.
