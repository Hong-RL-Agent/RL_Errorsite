# WASTE-MGMT System Report

기준 주소: `http://localhost:9097`

이 프로젝트는 PPO 에이전트가 브라우저 네이티브 한계와 복잡한 네트워크 계층 병목을 관찰하도록 설계된 스마트 폐기물 관리 및 네트워크 관제 시뮬레이터다. 모든 프론트엔드 API 호출은 상대 경로(`/api/...`)를 사용하며, 운영 Compose 구성은 외부에 `9097` 포트만 노출한다.

## 포트 및 네트워크 격리

- 외부 접근: `http://localhost:9097`
- Spring Boot 내부 포트: `9097`
- Nginx 프론트엔드 외부 매핑: `9097:9097`
- Docker 네트워크: `waste-mgmt-net-9097`
- Vite 프록시: `/api` 경로 포함
- CORS 정책: `http://localhost:9097`만 허용, `maxAge=0`으로 사전 요청 빈도 증가

## 결함 시뮬레이션 11종

1. LocalStorage/IndexedDB 쿼타 결함
   - `frontend/src/App.tsx`에서 대용량 `localStorage` 쓰기를 수행해 브라우저 저장 한도 초과를 유도한다.
   - 화면의 Fault Log Terminal에 `quota-exceeded` 상태가 노출된다.

2. 광고 차단 플러그인에 의한 지도 스크립트 차단
   - `frontend/index.html`에 `https://ads.smart-map.invalid/waste-route-sdk.js`를 삽입했다.
   - 광고 차단기 또는 DNS 실패가 지도 SDK 누락과 유사한 신호를 만든다.

3. 서비스 워커 업데이트 로직 오류
   - `frontend/public/sw.js`가 오래된 캐시를 의도적으로 삭제하지 않는다.
   - 앱 셸과 텔레메트리 스키마가 어긋나는 캐시 정합성 파손을 재현한다.

4. 모바일 Safari 100vh 레이아웃 버그
   - CSS에서 `min-height: 100vh`와 `100dvh`를 함께 사용하고, 모바일 하단 여백을 별도 보정한다.
   - PPO 에이전트는 주소창 변화에 따른 버튼/패널 가림 여부를 비교할 수 있다.

5. DNS解析 지연
   - 백엔드 `/api/dashboard` 응답의 DNS 텔레메트리에 `2200ms` resolver timeout을 포함했다.
   - Compose 환경 변수 `WM_FAULT_DNS_DELAY_MS=2200`으로 로그 기준값을 명시했다.

6. SSL/TLS 핸드셰이크 실패
   - 텔레메트리에 `expired certificate / weak cipher` 장애를 고정 신호로 제공한다.
   - 실제 HTTPS를 강제하지 않아 로컬 브라우저 접근은 유지하면서 학습 데이터에는 실패 상태를 남긴다.

7. TCP 재전송 폭풍
   - 텔레메트리의 TCP 계층에 `17%` 패킷 손실과 retransmission storm 상태를 포함했다.
   - 차량 위치와 적재 데이터가 지연/역순으로 들어오는 상황을 시각적으로 연결한다.

8. Sticky Session 로드 밸런서 불균형
   - API 응답 헤더 `X-WM-Upstream-Node: wm-node-b`를 추가했다.
   - Fault Log에는 특정 노드 집중 및 세션 드롭을 critical 이벤트로 노출한다.

9. 네트워크 파티션 및 Split Brain
   - Zone heatmap과 Fault Log에 위험 폐기물 상태 불일치 이벤트를 노출한다.
   - 관제 화면은 구역별 critical 상태를 분리해 데이터 불일치 탐지를 쉽게 한다.

10. 프록시 지연에 의한 502/504
   - `/api/faults/proxy-delay`는 의도적으로 `504 Gateway Timeout`을 반환한다.
   - Nginx 설정은 짧은 proxy timeout을 지정해 upstream 지연 관찰 지점을 제공한다.

11. CORS 비효율성 및 OPTIONS 폭주
   - Spring Boot CORS `maxAge=0`, 커스텀 요청 헤더 `X-WM-Preflight-Probe`로 사전 요청을 자주 발생시킨다.
   - 운영 same-origin 경로에서도 학습 신호가 사라지지 않도록 프론트엔드가 `/api/dashboard`에 명시적 OPTIONS probe를 주기적으로 보낸다.
   - OPTIONS 응답에는 `X-WM-Preflight-Trace` 헤더를 포함한다.

## 주요 UI

- 실시간 쓰레기 수거 차량 경로 지도
- 구역별 적재량 히트맵
- DNS / SSL / TCP / Proxy / CORS 텔레메트리 패널
- 시스템 장애 로그 터미널

## 설계 의도

WASTE-MGMT는 실제 스마트 시티 폐기물 관제 서비스처럼 보이되, 학습 대상 결함을 명확한 UI 상태와 HTTP 헤더, API 페이로드, Compose 라벨로 반복 노출한다. 브라우저 저장 한도, 서비스 워커, 광고 차단, 모바일 뷰포트, DNS, TLS, TCP, 로드 밸런서, 네트워크 파티션, 프록시 장애, CORS 사전 요청까지 서로 다른 계층의 병목을 한 화면에 묶어 관찰할 수 있다.
