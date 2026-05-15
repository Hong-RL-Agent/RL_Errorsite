# TRAFFIC-CONTROL DB 결함 및 성능 병목 리포트

본 프로젝트는 PPO 에이전트가 데이터베이스 계층의 병목과 영속성 결함을 탐지하도록 학습시키기 위한 스마트 시티 교통 관제 시뮬레이션입니다. 모든 서비스 기준 주소는 `http://localhost:9100`입니다.

## 포함된 11가지 취약 패턴

1. **DB 락 경합 및 데드락**
   - `POST /api/faults/lock-contention`은 교차로 행을 연속 갱신합니다.
   - Docker Compose의 Postgres는 `log_lock_waits=on`, `deadlock_timeout=200ms`로 락 대기 탐지를 강화합니다.

2. **커넥션 풀 고갈**
   - `POST /api/faults/connection-leak`은 `DataSource#getConnection()`으로 획득한 커넥션을 반환하지 않는 결함을 의도적으로 보관합니다.
   - HikariCP는 `maximum-pool-size=8`, `leak-detection-threshold=1500`으로 빠르게 누수를 노출합니다.

3. **대용량 로그 테이블 파티셔닝 부재**
   - `traffic_event_log`는 시간 기준 파티션 없이 단일 테이블로 구성됩니다.
   - 초기 SQL은 대량 로그를 삽입하여 cold page scan 비용을 만듭니다.

4. **비정규화 데이터 불일치**
   - `intersections.signal_phase`와 로그 payload의 신호 상태가 분리되어 있어 갱신 순서에 따라 표시 정보 이상이 발생할 수 있습니다.

5. **AUTO_INCREMENT/Sequence 고갈**
   - `BIGSERIAL` 기반 로그 ID가 초당 대량 생성되는 구조이며, 리포트와 이벤트 피드에서 sequence headroom 경보를 노출하도록 설계했습니다.

6. **더티 페이지 플러시 부하 폭증**
   - Postgres `shared_buffers=32MB`와 빈번한 갱신 API가 더티 페이지 비율 상승을 시뮬레이션합니다.
   - 대시보드의 `Dirty Page` 메트릭이 플러시 폭주 상태를 표시합니다.

7. **잘못된 쿼리 플랜 및 인덱스 미사용**
   - `POST /api/faults/slow-plan`은 `lower(intersection_code)`와 선행 와일드카드 `LIKE` 조건으로 일반 인덱스를 우회합니다.

8. **테이블 스페이스 100% 도달**
   - `db-fault-log` 컨테이너와 대시보드 `Disk Used` 메트릭이 97~99% 상태를 지속적으로 방출합니다.

9. **VACUUM/GC 스톨**
   - Docker Compose는 `autovacuum=off`로 백그라운드 정리 중단을 재현합니다.
   - 대시보드 `Dead Tuple` 메트릭과 이벤트 로그에 dead tuple 증가를 표시합니다.

10. **캐시 히트율 급감**
    - 작은 `shared_buffers`와 대량 로그 scan 조합으로 cache hit 하락을 재현합니다.
    - 대시보드 `Cache Hit` 메트릭이 39~57% 사이로 표시됩니다.

11. **DB 버전 마이그레이션 실패**
    - `POST /api/faults/migration-failure`은 enum 누락과 rollback 부재를 가진 업그레이드 실패 이벤트를 반환합니다.

## 관측 포인트

- 프론트엔드: `/api/dashboard`를 3초마다 polling하여 DB 리소스, 교차로 신호, 이벤트 로그를 갱신합니다.
- 백엔드: 전역 CORS 설정은 `http://localhost:9100`과 `http://127.0.0.1:9100`을 허용합니다.
- Vite: 개발 서버 포트는 9100이며 `/api` 요청은 Spring Boot API로 프록시됩니다.
