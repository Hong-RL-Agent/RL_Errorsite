# BUGS - site011

## site011-bug01
- type: rag-context-truncation
- API endpoint: POST /api/rag/query
- HTTP method: POST
- 발생 조건: longContext=true 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site011-bug01"]
- 사용자 증상: 답변이 문맥과 맞지 않거나 "정보를 찾을 수 없다"는 식의 오답을 반환함
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "answer": "I'm sorry, I couldn't find relevant information...",
    "bugId": "site011-bug01",
    "source": "Company Guidelines v2"
  }
- 코드상 의도된 원인: 특정 조건에서 컨텍스트 데이터를 강제로 누락시킴
- PPO 기대 행동: 입력 파라미터에 따른 답변의 품질 저하 및 일관성 결여 탐지

## site011-bug02
- type: polymorphic-mapping-error
- API endpoint: GET /api/docs/mixed-types
- HTTP method: GET
- 발생 조건: 항상 (혼합 문서 타입 로드 시)
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site011-bug02"]
- 사용자 증상: 일부 문서의 상세 정보(페이지 수 등)가 null로 표시되거나 구조가 깨짐
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "id": 1, ... }, { "id": 2, "title": "Log TXT", "extra": null } ],
    "bugId": "site011-bug02"
  }
- 코드상 의도된 원인: 데이터 스키마 불일치로 인한 매핑 실패
- PPO 기대 행동: 데이터 목록 내의 구조적 비정상성(Null 값) 탐지

## site011-bug03
- type: json-precision-loss
- API endpoint: GET /api/stats/large-number
- HTTP method: GET
- 발생 조건: 항상
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site011-bug03"]
- 사용자 증상: 화면에 표시되는 숫자가 원본 데이터와 다르게 반올림되거나 깨져 보임
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "processedValue": 90071992547409930000,
    "bugId": "site011-bug03"
  }
- 코드상 의도된 원인: JavaScript의 Number 범위를 초과하는 정수를 Number 타입으로 처리
- PPO 기대 행동: 원본 문자열 데이터와 서버 처리 후 숫자 데이터의 불일치 탐지

## site011-bug04
- type: gc-stop-the-world
- API endpoint: GET /api/system/gc
- HTTP method: GET
- 발생 조건: pause=true 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site011-bug04"]
- 사용자 증상: 요청 시 5초 동안 응답이 멈추고 화면에 로딩 스피너가 지속됨
- 서버 응답 상태 코드: 200 (지연 후)
- 서버 응답 예시:
  {
    "ok": true,
    "message": "GC Collection completed after 5000ms pause",
    "bugId": "site011-bug04"
  }
- 코드상 의도된 원인: 인위적인 setTimeout 지연을 통한 Stop-the-World 재현
- PPO 기대 행동: API 응답 시간의 비정상적인 지연(Latency) 탐지

## site011-bug05
- type: offheap-memory-leak
- API endpoint: GET /api/system/memory
- HTTP method: GET
- 발생 조건: leak=true 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site011-bug05"]
- 사용자 증상: 시스템 모니터의 메모리 사용량이 클릭할 때마다 급격히 증가함
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "usageMB": 342.5,
    "bugId": "site011-bug05"
  }
- 코드상 의도된 원인: 요청 시마다 메모리 사용량 수치를 누적 증가시킴
- PPO 기대 행동: 리소스 사용량의 비정상적인 우상향 트렌드(Leak) 탐지
