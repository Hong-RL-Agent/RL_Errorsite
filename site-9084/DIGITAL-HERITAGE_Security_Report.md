# DIGITAL-HERITAGE Security Report

본 문서는 PPO 에이전트의 방어 학습과 비즈니스 연속성 취약점 분석을 위한 모의 시나리오 보고서입니다. 모든 항목은 운영 환경 공격 재현이 아닌 관제, 복구, 의사결정 실패를 식별하기 위한 안전한 시뮬레이션으로 작성되었습니다.

## Scope

- 서비스 기준 주소: `http://localhost:9084`
- API 기준 경로: `/api/heritage/dashboard`
- 시스템: Spring Boot 3.x backend, React + Vite + Tailwind v4 frontend, Docker Compose isolated network
- 훈련 목적: WAF/SIEM/SOC/IRP/Backup/DR/Legacy Migration 취약점의 탐지 및 복구 체계 개선

## 1. WAF 탐지 맹점

특정 인코딩, 정규화 순서, 헤더 변형 계열의 요청이 검사 단계 이후에 정상화되어 위험도가 낮게 산정되는 상황을 가정했다. 관제 화면의 `WAF · Canonicalization gap` 신호는 탐지 신뢰도 41%로 표시되며, 우회 문자열 자체가 아닌 탐지 파이프라인 순서 오류를 훈련 대상으로 삼는다.

개선안: 입력 정규화와 검사 순서를 통합하고, 다단계 디코딩 후 동일 정책을 반복 적용한다. WAF 허용 로그도 SIEM 상관분석 대상에 포함한다.

## 2. SIEM 오탐 과다

무해한 정책 위반과 낮은 위험도 이벤트가 폭증해 실제 자격 증명 재사용 징후가 묻히는 시나리오다. 화면의 `False-positive storm` 이벤트는 신뢰도 27%로, 알람 피로가 사고 식별을 지연시키는 상태를 나타낸다.

개선안: 이벤트 중복 제거, 위험 기반 점수화, 알람 억제 규칙의 만료 시간 설정, 고위험 엔티티 중심의 상관분석을 적용한다.

## 3. 야간 관제 인력 부재

`02:13:44 SOC ERROR` 로그는 야간 교대 공백으로 침해 이벤트가 312분 동안 확인되지 않은 상황을 나타낸다. 사고 발생 시각과 최초 인지 시각의 차이가 MTTD를 크게 악화시킨다.

개선안: 온콜 로테이션, 자동 에스컬레이션, 임계 이벤트 음성 알림, 외부 관제 백업 계약을 마련한다.

## 4. IRP 부재

아카이브 암호화 이벤트에 대한 승인된 사고 대응 매뉴얼이 없어 격리, 보존, 복구 순서가 충돌하는 시나리오다. `IRP · No approved response playbook` 신호는 대응 실패 상태로 표시된다.

개선안: 랜섬웨어, 데이터 정합성 손상, 물리 재난, 공급망 장애별 IRP를 문서화하고 분기별 테이블탑 훈련을 수행한다.

## 5. 백업 서버 랜섬웨어 전염

핫 백업 저장소가 운영망과 충분히 분리되지 않아 랜섬웨어 훈련 페이로드가 백업 카탈로그까지 암호화한 상태다. 복구 가능한 스냅샷 목록이 사라져 실제 복구 가능성이 급락한다.

개선안: 불변 백업, 별도 인증 영역, 백업 관리망 분리, 쓰기 1회 저장 정책, 복구 계정 MFA를 적용한다.

## 6. DR Mock 미비

복구 테스트가 정책 주기를 넘겨 실제 장애 시 복구 엔진이 사전 점검에서 정지하는 상황이다. 화면의 `DR · Mock recovery gap`은 복구 엔진 정지와 절차 검증 실패를 나타낸다.

개선안: 자동화된 월간 복구 리허설, 샘플 데이터 복원 검증, 복구 스크립트 드리프트 감지, 결과 보고서 승인을 의무화한다.

## 7. 콜드 백업 테이프 파손

물리 보관소 습도와 온도가 기준을 벗어나 자기 테이프 산화층 손상이 발생한 시나리오다. `Cold Tape Health` 지표가 46%로 내려가 장기 보존 매체의 신뢰성이 낮아진다.

개선안: 온습도 센서 이중화, 보관함 밀폐 점검, 매체 샘플링 판독, 수명 주기별 재기록 정책을 운영한다.

## 8. 오프사이트 백업 부재

주 저장소와 백업 저장소가 동일 재난 영향권에 있어 침수, 화재, 전력 장애 시 동시 소실될 수 있는 위험이다. DR 로그에는 오프사이트 복제본 부재가 경고로 기록된다.

개선안: 지역 분산 복제, 클라우드 격리 보관, 정기 반출, 지리적 위험도 기반 저장소 배치를 수행한다.

## 9. RTO 초과

목표 복구 시간 8시간 대비 현재 복구 예상이 19시간으로 늘어난 상태다. 의사결정 지연, 복구 절차 미검증, 백업 카탈로그 손상이 복합적으로 작용한다.

개선안: 핵심 서비스 우선순위 지정, 병렬 복구 절차, 자동화된 인프라 재구성, RTO별 서비스 등급을 확정한다.

## 10. RPO 데이터 유실

목표 복구 시점 4시간 대비 실제 데이터 손실 구간이 37시간으로 확대된 시나리오다. 백업 주기 설정 오류와 실패 알림 누락이 원인이다.

개선안: 백업 성공률 SLO, 백업 완료 증적 검증, 실패 시 재시도와 에스컬레이션, 변경량 기반 증분 백업을 적용한다.

## 11. 구형 플랫폼 이전 정합성 파손

구형 플랫폼에서 최신 환경으로 이전하는 동안 문자 인코딩, 필드 순서, 날짜 정밀도, NULL 처리 방식 차이로 14,208건의 문화 기록 체크섬이 불일치하는 상황이다.

개선안: 이전 전후 스키마 계약, 샘플링이 아닌 전체 해시 검증, 롤백 가능한 이중 기록 기간, 변환 규칙 버전 관리를 도입한다.

## Simulation Mapping

| Scenario | UI/API Location | Training Signal |
| --- | --- | --- |
| WAF blind spot | SOC board, DR terminal | Missed WAF detection |
| SIEM false positives | SOC board | Alarm overload |
| Night shift delay | DR terminal | Delayed acknowledgement |
| Missing IRP | SOC board | Failed response |
| Ransomware backup encryption | DR terminal, RTO/RPO gauges | Backup catalog encrypted |
| DR Mock gap | SOC board, DR terminal | Restore engine halted |
| Cold tape damage | Timeline, gauges | Media health critical |
| No offsite backup | DR terminal | Shared disaster radius |
| RTO breach | Gauge panel | 19h vs 8h |
| RPO breach | Gauge panel | 37h vs 4h |
| Legacy migration corruption | Timeline, DR terminal | Checksum mismatch |

## Control Objectives

- 모든 외부 접근은 `http://localhost:9084`로 수렴시킨다.
- 프론트엔드는 API 호출에 상대 경로 `/api/...`만 사용한다.
- Docker Compose 네트워크 이름은 `digital-heritage-9084`로 격리한다.
- 리포트와 UI는 공격 절차가 아니라 탐지 실패, 복구 실패, 운영 통제 개선에 초점을 둔다.
