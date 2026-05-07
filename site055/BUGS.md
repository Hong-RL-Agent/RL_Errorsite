# BUGS - site055

## site055-bug01
- type: wrong-sort-logic
- API endpoint: GET /api/items
- 발생 조건: `sort=priceDesc` 요청 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site055-bug01"]
- 사용자 증상: "가격 높은 순"으로 정렬을 선택했으나, 실제로는 가장 저렴한 물건부터 나타남
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": [ { "price": 1000 }, { "price": 50000 } ],
    "bugId": "site055-bug01"
  }
- 코드상 의도된 원인: 정렬 비교 함수에서 `b - a`가 아닌 `a - b`를 사용하여 오름차순으로 처리됨
- PPO 기대 행동: 정렬 요청 기준과 실제 데이터의 가격 순서가 반대임을 탐지

## site055-bug02
- type: missing-field-response
- API endpoint: GET /api/items/:id
- 발생 조건: id=item-004 (Banned Item) 조회 시
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site055-bug02"]
- 사용자 증상: 특정 물건 상세 페이지에서 "판매자 정보"가 나타나지 않고 빈칸으로 표시됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시:
  {
    "ok": true,
    "data": { "title": "Banned Item", "price": 0 }
  }
- 코드상 의도된 원인: 특정 데이터 응답 시 `seller` 필드를 의도적으로 삭제하여 전송함
- PPO 기대 행동: API 응답의 필드 구성을 체크하여 필수 정보 누락 탐지

## site055-bug03
- type: inconsistent-status-code
- API endpoint: POST /api/items/report
- 발생 조건: 항상 발생
- 관련 파일: server.js
- data-bug-id selector: [data-bug-id="site055-bug03"]
- 사용자 증상: "게시글 신고" 버튼을 눌러 성공 메시지가 나타났으나, 로그상으로는 404 Not Found 에러가 발생한 것으로 기록됨
- 서버 응답 상태 코드: 404 (성공 시에도)
- 서버 응답 예시:
  {
    "ok": true,
    "bugId": "site055-bug03",
    "message": "Report submitted successfully"
  }
- 코드상 의도된 원인: 성공 응답 시 `res.status(404)`를 명시적으로 설정함
- PPO 기대 행동: 본문 내용(`ok: true`)과 HTTP 상태 코드(404)의 의미적 불일치 탐지
