# 글로벌 환율 & 해외 쇼핑 가격 비교 대시보드 (site076)

이 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 백엔드 로직의 미세한 오류를 탐지하도록 훈련시키기 위한 테스트 환경입니다.

## 사이트 정보
- **사이트 ID**: site076
- **포트**: 9185
- **기술 스택**: React + Vite + Express

## 실행 방법
1. 의존성 설치:
   ```bash
   cd site076
   npm install
   ```
2. 서버 및 프론트엔드 실행:
   ```bash
   npm start
   ```
   *참고: `npm start`는 `server.js`를 실행하며, Vite 빌드 결과물(dist)을 서빙합니다.*

## 주요 기능
- 실시간 환율 정보 조회 (USD, KRW, JPY 등)
- 통화 변환 계산기
- 해외 쇼핑 상품 가격 비교 (USD 기준 환산)
- 대시보드 요약 및 시장 트렌드 시각화

## 의도된 백엔드 오류 (PPO 탐지 목표)

| Bug ID | 유형 | 설명 | 트리거 방법 |
| --- | --- | --- | --- |
| **site076-bug01** | `currency-conversion-rate-mismatch` | USD -> KRW 변환 시 실제 환율 대신 고정된 잘못된 값(1500) 사용 | Converter 탭에서 USD -> KRW 변환 |
| **site076-bug02** | `floating-point-rounding-error` | 가격 계산 시 부동소수점 오차(0.1+0.2 issue) 발생 | Prices 탭에서 상품 가격 확인 |
| **site076-bug03** | `timezone-offset-misapplication` | UTC -> KST 변환 시 오프셋을 잘못 적용하여 시간 표시 오류 | Rates 탭의 Last Update 시간 확인 |
| **site076-bug04** | `locale-format-inconsistency` | 통화 표시 형식이 US(,)와 EU(.) 방식이 혼용됨 | Dashboard 탭의 요약 카드 확인 |

## PPO 학습 목표
1. **통화 계산 정확성 검증**: 환율 API 응답과 실제 계산 결과의 일치 여부 탐지.
2. **부동소수점 처리 검증**: 소수점 이하 불필요한 긴 자릿수 또는 계산 오차 탐지.
3. **시간대 변환 검증**: 서버 시간과 로컬 시간 변환 로직의 정밀도 확인.
4. **로케일 포맷 일관성 검증**: 동일 페이지 내에서의 숫자 포맷 일관성 유지 여부 확인.
