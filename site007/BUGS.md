# BUGS

## 1. site007-bug01
- **Bug ID:** `site007-bug01`
- **CSV Error:** DB 동시성 충돌
- **Type:** `database-concurrency`
- **발생 위치:** `server.js` 의 `POST /api/bookings` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (예약 확정하기 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#submit-booking-btn[data-bug-id="site007-bug01"]`
- **사용자가 경험하는 증상:** 
  - 원래는 '예약 불가' 처리되어야 할 회색의 비활성화된 시간대(예: 취소선이 그어진 시간)를 프론트엔드에서 강제로 클릭한 뒤 `[예약 확정하기]`를 누르면, 백엔드에서 튕겨내지 않고 중복 예약을 그대로 승인해 버립니다.
- **코드상 의도된 원인:**
  - 예약 등록 POST 요청 처리 시, `bookings` 배열(DB)을 순회하며 동일한 `roomId`, `date`, `time`에 이미 확정된(`status: confirmed`) 예약이 존재하는지 확인하고 겹치면 `409 Conflict` 에러를 던져야 하지만 이 검증 로직이 누락되었습니다.
- **PPO 에이전트 기대 행동:**
  - 동일한 자원(룸, 시간대)에 대해 중복 선점 요청을 보냈을 때 서버가 트랜잭션 충돌 관리를 하지 않고 중복 상태를 허용하는 데이터 동시성 및 무결성 결함을 탐지해야 합니다.

## 2. site007-bug02
- **Bug ID:** `site007-bug02`
- **CSV Error:** CORS 설정 오류
- **Type:** `network-cors`
- **발생 위치:** `server.js` 의 `GET /api/notices` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (공지 새로고침 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#refresh-notices[data-bug-id="site007-bug02"]`
- **사용자가 경험하는 증상:**
  - 예약하기 화면 좌측 하단의 '공지사항' 탭이 무한 로딩되거나 "CORS 정책으로 인해 데이터를 불러올 수 없습니다"라는 에러 메시지가 뜹니다. 개발자 도구의 콘솔을 열어보면 CORS 관련 빨간 에러를 명확히 볼 수 있습니다.
- **코드상 의도된 원인:**
  - 백엔드에서 해당 공지사항 API 응답 시 고의로 `res.setHeader('Access-Control-Allow-Origin', 'http://invalid-domain.com');` 헤더를 박아 넣었습니다. 브라우저는 현재 도메인(`localhost:9336`)과 헤더의 도메인이 달라 보안 정책상 데이터를 차단합니다.
- **PPO 에이전트 기대 행동:**
  - XHR/Fetch 요청 시 `Access-Control-Allow-Origin` 헤더 설정 오류로 인해 클라이언트 측 네트워크 통신이 브라우저 차단에 의해 실패하는 환경 구성 취약점을 감지해야 합니다.

## 3. site007-bug03
- **Bug ID:** `site007-bug03`
- **CSV Error:** 관리자 권한 검증 누락
- **Type:** `security-authorization`
- **발생 위치:** `server.js` 의 `GET /api/bookings/all` 엔드포인트
- **관련 파일:** `server.js`, `public/index.html` (전체 예약 보기 버튼), `public/js/app.js`
- **data-bug-id Selector:** `#fetch-all-btn[data-bug-id="site007-bug03"]`
- **사용자가 경험하는 증상:**
  - '내 예약' 탭에서 우측 상단에 마련된 `[전체 예약 보기 (관리자 권한 검증 우회)]` 버튼을 누르면 일반 사용자인 상태임에도 시스템 내의 모든 사용자(예: 타인)의 예약 내역 리스트가 그대로 화면에 렌더링됩니다.
- **코드상 의도된 원인:**
  - `GET /api/bookings/all` API 내부에서 요청을 보낸 사용자가 실제 `admin` Role을 가진 관리자인지 토큰이나 세션을 통해 인가(Authorization) 검증하는 로직이 완전히 빠져 있습니다.
- **PPO 에이전트 기대 행동:**
  - 일반 권한을 부여받은 상태에서 관리자 등급의 URL Path나 API 리소스에 접근했을 때 `403 Forbidden` 등의 차단 조치 없이 민감한 전체 데이터가 노출되는 인가 우회(Broken Access Control) 상태를 식별해야 합니다.
