# BUGS - site085

### [Bug #1] site085-bug01
- **Type**: csv-delimiter-misparse (CSV 구분자 파싱 오류)
- **API**: `POST /api/upload`
- **Description**: 서버가 쉼표(,)만 지원하도록 제한되어 있어, 세미콜론(;)을 사용하는 파일 업로드 시 필드 분리가 실패하고 전체 행이 하나의 문자열로 처리됨.

### [Bug #2] site085-bug02
- **Type**: field-mapping-shift (필드 매핑 밀림)
- **API**: `GET /api/stats/category`
- **Description**: 집계 로직에서 객체의 키값을 `r.category`가 아닌 `r.desc`로, 밸류를 `r.amount`가 아닌 `r.id * 1000`으로 매핑하여 분석 데이터 왜곡 발생.

### [Bug #3] site085-bug03
- **Type**: type-conversion-failure (타입 변환 실패)
- **API**: `GET /api/stats/monthly`
- **Description**: 특정 월의 데이터를 합산할 때 숫자 필드에 문자열을 강제로 더하여 `NaN`이 발생하게 유도함. 이로 인해 해당 월의 전체 통계가 깨짐.

### [Bug #4] site085-bug04
- **Type**: duplicate-record-double-count (중복 레코드 이중 집계)
- **API**: `GET /api/stats`
- **Description**: 총 지출액을 계산하는 `reduce` 로직 외부에 특정 레코드들의 금액을 수동으로 한 번 더 더해주는 코드를 삽입하여 중복 합산 발생.
