# VIRTUAL-STADIUM Stability Report

기준 주소: `http://localhost:9098`

본 프로젝트는 PPO 에이전트가 대규모 실시간 스포츠 스트리밍 환경의 네트워크 병목과 운영 결함을 학습할 수 있도록, 아래 11가지 취약 패턴을 API 응답, UI 경보, 운영 로그, Docker 네트워크 구성 설명에 반영한다.

## 1. Asymmetric Routing

- 시뮬레이션 위치: `StadiumTelemetryService`, 라우트 상태 `ASYMMETRIC`
- 현상: 요청은 `edge-seoul`로 유입되지만 응답 패킷이 다른 POP 또는 origin 경로로 이탈한다.
- 탐지 신호: TCP 재전송 증가, 특정 ISP 구간의 one-way latency 편차, stateful firewall drop
- 권장 대응: return-path pinning, flow hash 정책 검증, 방화벽 세션 테이블 관찰

## 2. SNAT Port Exhaustion

- 시뮬레이션 위치: `network.natPortsUsed / natPortsTotal`
- 현상: 대규모 동시 접속과 짧은 연결 재시도로 NAT ephemeral port pool이 고갈된다.
- 탐지 신호: outbound connect timeout, NAT gateway allocation error, SYN retry 폭증
- 권장 대응: NAT gateway scale-out, connection reuse, idle timeout 조정

## 3. Bandwidth Saturation

- 시뮬레이션 위치: `network.bandwidthUtilization`, `streamBitrateGbps`
- 현상: 4K 멀티뷰 스트리밍 트래픽 폭주로 uplink가 포화된다.
- 탐지 신호: packet loss, queue depth 증가, ABR 품질 급락
- 권장 대응: bitrate ladder 하향, CDN offload 증설, hot event capacity reservation

## 4. WebSocket Reconnection Failure

- 시뮬레이션 위치: 라우트 상태 `DEGRADED`, 운영 로그 `ws-gateway`
- 현상: 연결 끊김 후 클라이언트가 정상 재연결하지 못하고 세션이 정지한다.
- 탐지 신호: heartbeat timeout 이후 reconnect attempt가 0인 세션 증가
- 권장 대응: jittered exponential backoff, heartbeat timeout, stale session cleanup

## 5. BGP Blackhole

- 시뮬레이션 위치: incident `BGP-BH-05`, 운영 로그 `bgp-watch`
- 현상: 특정 경로가 blackhole community 또는 잘못된 route-map으로 null route에 광고된다.
- 탐지 신호: 특정 prefix reachability 0%, traceroute 중단, route table 이상
- 권장 대응: route-map rollback, prefix validation, RPKI 및 change approval

## 6. MTU Mismatch

- 시뮬레이션 위치: `network.mtu=1400`, `expectedMtu=1500`
- 현상: 큰 스트리밍 패킷이 터널 구간에서 조각화되거나 드롭된다.
- 탐지 신호: large packet loss, PMTUD 실패, ICMP fragmentation-needed 차단
- 권장 대응: MSS clamping, PMTUD 허용, overlay MTU 표준화

## 7. CDN Edge Cache Consistency Error

- 시뮬레이션 위치: route defect `poisoned cache object`
- 현상: 오염된 스코어보드 또는 manifest JSON이 일부 CDN edge에 잔류한다.
- 탐지 신호: edge별 응답 ETag 불일치, stale score, cache hit이 높지만 데이터가 틀림
- 권장 대응: signed version key, targeted purge, origin shield 재검증

## 8. DDoS Resource Exhaustion

- 시뮬레이션 위치: incident `DDOS-08`
- 현상: 봇 트래픽 스파이크가 worker queue, websocket gateway, NAT pool을 동시에 압박한다.
- 탐지 신호: request rate 급증, CPU steal, connection backlog 증가
- 권장 대응: rate limiting, challenge, scrubbing center, autoscaling guardrail

## 9. Incomplete Deployment

- 시뮬레이션 위치: 운영 로그 `deploy`, route state `PARTIAL`
- 현상: 배포 스크립트가 origin 일부만 업데이트해 manifest와 API 버전이 분기된다.
- 탐지 신호: origin별 build id 불일치, canary check 미통과, cache fragmentation
- 권장 대응: deployment inventory 검증, canary gate, immutable artifact promotion

## 10. Config Drift

- 시뮬레이션 위치: incident `DRIFT-10`
- 현상: 운영자가 수동 변경한 timeout, route, cache TTL이 선언형 설정과 어긋난다.
- 탐지 신호: GitOps desired state와 live state 차이, 재시작 후 설정 회귀
- 권장 대응: drift detection, reconcile loop, break-glass 변경 감사

## 11. Secret Expiration

- 시뮬레이션 위치: incident `SECRET-11`, 운영 로그 `secret-rotator`
- 현상: CDN origin token 또는 websocket signing key가 만료되어 전체 연결이 차단된다.
- 탐지 신호: 인증 실패율 100%, 401/403 급증, secret expiry timestamp 초과
- 권장 대응: rotation window, expiry SLO, dual-key rollout, 만료 전 알림

## 포트 및 격리 검증

- 외부 접속 포트는 `9098`만 사용한다.
- 프론트엔드는 `fetch('/api/stadium/snapshot')`처럼 상대 경로만 사용한다.
- Vite 프록시는 `/api`를 백엔드로 전달하며 Docker 환경에서는 `VITE_API_TARGET=http://backend:8080`을 사용한다.
- Docker 네트워크는 `virtual-stadium-net-9098`로 분리되어 이전 프로젝트 네트워크와 섞이지 않는다.
- Docker 기본 주소 풀이 고갈된 환경에서도 생성되도록 전용 IPAM 서브넷 `10.90.98.0/24`를 명시한다.
