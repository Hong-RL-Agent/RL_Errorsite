# NEWS-FEED Security Report

대상 서비스: `http://localhost:9078`  
작성일: 2026-05-05  
목적: PPO 에이전트가 공급망 공격과 광범위한 네트워크 인프라 결함을 탐지하도록 학습시키기 위한 시뮬레이션 명세

## 범위

NEWS-FEED는 지능형 뉴스 피드 플랫폼을 가정한다. 본 프로젝트는 실제 공격 수행 도구가 아니라, 취약 패턴을 관측 가능한 데이터, 설정, UI, 로그 형태로 노출하는 방어 학습용 시뮬레이션이다.

## 11개 보안 및 인프라 안티패턴

1. Helm Chart 설정 파일 내 DB 비밀번호 평문 하드코딩  
   위치: `infra/helm/news-feed/values.yaml`  
   지표: `database.password` 값이 평문으로 존재한다.

2. 카피레프트 라이선스 라이브러리 무단 사용에 의한 법적 리스크 시뮬레이션  
   위치: `backend/pom.xml`, API 인벤토리 응답  
   지표: 승인되지 않은 라이선스 검토 항목이 Incident Ledger에 노출된다.

3. 서버 데이터 암호화 및 접근 불가 상태, 랜섬웨어 감염 시연  
   위치: `/api/incidents`, `/api/dashboard`  
   지표: `article_archive.enc` 접근 불가 상태가 사고 로그로 제공된다.

4. 백그라운드 자원 무단 점유 및 성능 저하, 크립토재킹 현상  
   위치: `/api/incidents`, `infra/logs/security-incidents.log`  
   지표: CPU 점유율 급등과 백그라운드 miner 시뮬레이션이 인벤토리에 표시된다.

5. 트래픽 폭주 시 방어 로직 무력화 및 가용성 상실, DDoS 실패  
   위치: `/api/inventory`, `/api/incidents`  
   지표: priority traffic 예외 경로에서 rate limiter 우회가 표시된다.

6. 네트워크 경로 우회로 인한 트래픽 가로채기, BGP Hijacking 재현  
   위치: `/api/network-traces`  
   지표: 예상치 못한 ASN `AS64496`이 경로 중간에 등장한다.

7. DNS 응답 조작을 통한 악성 도메인 유도, DNS Spoofing  
   위치: `/api/network-traces`, `infra/logs/security-incidents.log`  
   지표: `partner-login-clone.news-feed.invalid` 응답이 표시된다.

8. 통신 암호화 부재 혹은 취약한 인증서 노출, MITM  
   위치: `/api/incidents`  
   지표: 약한 인증서 체인과 중간자 공격 가능성이 Incident Ledger에 표시된다.

9. 관리자 권한 탈취를 유도하는 특정 파트너사 페이지 감염, Watering Hole  
   위치: `/api/news`, `/api/incidents`  
   지표: 파트너 미디어 관리자 로그인 유도 이벤트가 뉴스 카드에 연결된다.

10. 서드파티 패키지 업데이트를 통한 악성 코드 자동 유포, Supply Chain Attack  
    위치: `/api/news`, `/api/incidents`, `infra/logs/security-incidents.log`  
    지표: `reader-segmenter@2.4.1` 자동 업데이트 후 의심스러운 postinstall 훅이 기록된다.

11. 내부 관리자에 의한 로그 삭제 및 무단 데이터 반출, Insider Threat  
    위치: `/api/incidents`  
    지표: audit row 삭제 이후 export 이벤트가 발생한 것으로 표시된다.

## 포트 및 통신 격리

- 외부 진입점은 `http://localhost:9078`로 고정한다.
- React는 API를 `/api/...` 상대 경로로 호출한다.
- Docker Compose에서 `news-feed-web`만 호스트 포트 `9078:9078`을 공개한다.
- Nginx는 `/api` 요청을 내부 Spring Boot 서비스 `news-feed-api:9078`로 프록시한다.
- Spring Boot CORS는 `http://localhost:9078` 및 `http://127.0.0.1:9078`을 허용한다.

## 방어 관점 학습 포인트

- 시크릿은 Helm values에 평문으로 저장하지 않고 Kubernetes Secret 또는 외부 시크릿 관리자로 분리해야 한다.
- 라이선스 검토는 CI에서 자동화하고 승인 정책을 빌드 게이트로 적용해야 한다.
- BGP/DNS/TLS 관측 데이터는 애플리케이션 로그와 함께 상관 분석해야 한다.
- 공급망 업데이트는 lockfile, 서명 검증, postinstall 제한, SBOM 생성으로 통제해야 한다.
- 내부자 위협은 삭제 불가능한 감사 로그와 이중 승인 기반 반출 통제로 줄여야 한다.
