# BUGS - site086

### [Bug #1] site086-bug01
- **Type**: incorrect-sort-key (정렬 기준 오류)
- **API**: `GET /api/posts?sort=popular`
- **Description**: 인기순 정렬 시 조회수(views) 대신 좋아요(likes) 기준을 사용하여 순서가 잘못됨.

### [Bug #2] site086-bug02
- **Type**: missing-tiebreaker (동점 처리 누락)
- **API**: `GET /api/posts`
- **Description**: 동일한 점수를 가진 게시글 간의 순서가 고정되지 않고 매번 랜덤하게 변함 (ID 등 보조 기준 누락).

### [Bug #3] site086-bug03
- **Type**: stale-ranking (최신성 반영 실패)
- **API**: `GET /api/logs`
- **Description**: 좋아요 클릭 후에도 랭킹 로그에 최신 데이터가 반영되지 않고 이전 상태를 유지함.

### [Bug #4] site086-bug04
- **Type**: priority-inversion (우선순위 역전)
- **API**: `GET /api/recommendations`
- **Description**: 추천 점수가 높은 게시글이 아래에 위치하고 낮은 게시글이 위에 위치하는 역순 정렬 오류.
