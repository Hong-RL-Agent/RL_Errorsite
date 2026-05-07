# BUGS - site033

## site033-bug01
- **type**: language-edge-case
- **symptom**: 특정 유니코드 검색 시 검색 결과 0건 반환
- **description**: 문자열 비교 로직의 유니코드 노멀라이제이션 누락

## site033-bug02
- **type**: type-system-error
- **symptom**: 평점순 정렬이 실제 수치와 맞지 않음
- **description**: 평점 필드의 타입 혼용(Number/String)으로 인한 정렬 알고리즘 오작동

## site033-bug03
- **type**: runtime-behavior-error
- **symptom**: "알 수 없는 영화"라는 Fallback 제목 반환
- **description**: 예외 처리 블록 내에서 런타임 에러 발생 후 비정상 응답 반환

## site033-bug04
- **type**: test-side-effect
- **symptom**: 조회 요청만으로 원본 데이터의 평점이 무작위로 변경됨
- **description**: 테스트용 뮤테이션 API가 영속성 레이어에 직접 영향을 미침
