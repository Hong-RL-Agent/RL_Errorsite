# BUGS - site029

본 문서는 PPO 에이전트의 학습을 위해 의도적으로 삽입된 백엔드 로직 오류를 정리한 명세서입니다.

## site029-bug01
- **type**: edge-case-missing
- **API endpoint**: `GET /api/charts`
- **발생 조건**: `genre=unknown` 쿼리 파라미터 포함 시
- **관련 파일**: `server.js`
- **data-bug-id selector**: `[data-bug-id="site029-bug01"]`
- **사용자 증상**: 데이터 목록이 나타나지 않고 에러 메시지("차트 데이터를 불러올 수 없습니다")가 표시됨
- **서버 응답 상태 코드**: 200 (성공 응답이나 데이터가 불완전함)
- **서버 응답 예시**:
  ```json
  {
    "data": null,
    "bugId": "site029-bug01"
  }
  ```
- **코드상 의도된 원인**: 빈 배열 대신 null을 할당하여 프론트엔드의 배열 순회 로직 등을 방해함
- **PPO 기대 행동**: 특정 입력 조건에서 데이터 스키마가 깨지는 현상을 탐지

## site029-bug02
- **type**: arithmetic-operator-error
- **API endpoint**: `GET /api/charts`
- **발생 조건**: 모든 차트 목록 조회 시
- **관련 파일**: `server.js`
- **data-bug-id selector**: `[data-bug-id="site029-bug02"]`
- **사용자 증상**: 실제 랭킹은 올랐으나 UI상으로는 하락 화살표가 표시됨
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**:
  ```json
  {
    "rank": 5,
    "lastRank": 10,
    "rankChange": -5,
    "bugId": "site029-bug02"
  }
  ```
- **코드상 의도된 원인**: `lastRank - rank`가 아닌 `rank - lastRank`로 연산자를 잘못 사용
- **PPO 기대 행동**: 필드 간의 수치 관계(Rank vs LastRank)를 분석하여 `rankChange`의 모순을 탐지

## site029-bug03
- **type**: logical-operator-error
- **API endpoint**: `GET /api/charts`
- **발생 조건**: `genre`와 `minPlays` 파라미터가 동시에 전달될 때
- **관련 파일**: `server.js`
- **data-bug-id selector**: `[data-bug-id="site029-bug03"]`
- **사용자 증상**: 선택한 장르가 아니거나 재생 수가 낮은 곡들이 필터링 결과에 섞여 나옴
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**:
  ```json
  {
    "data": [
      { "genre": "Pop", "plays": 500000 },
      { "genre": "Rock", "plays": 1200000 }
    ],
    "bugId": "site029-bug03"
  }
  ```
- **코드상 의도된 원인**: 필터링 로직에서 AND(&&) 연산자 대신 OR(||) 연산자를 사용
- **PPO 기대 행동**: 쿼리 파라미터 조건과 반환된 데이터 집합 간의 불일치를 탐지

## site029-bug04
- **type**: sorting-logic-error
- **API endpoint**: `GET /api/charts/popular`
- **발생 조건**: 인기 차트 메뉴 진입 시
- **관련 파일**: `server.js`
- **data-bug-id selector**: `[data-bug-id="site029-bug04"]`
- **사용자 증상**: 재생 수가 가장 낮은 곡들이 차트 1~10위에 배치됨
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**:
  ```json
  {
    "data": [...],
    "sorted": "ascending",
    "bugId": "site029-bug04"
  }
  ```
- **코드상 의도된 원인**: 정렬 함수에서 내림차순(`b-a`)이 아닌 오름차순(`a-b`)을 적용
- **PPO 기대 행동**: 특정 수치 필드(plays)의 정렬 순서가 서비스 성격(인기 차트)과 맞지 않음을 탐지
