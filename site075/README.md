# 팟캐스트 스트리밍 & 에피소드 관리 플랫폼 (site075)

본 사이트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 HTTP 스트리밍 헤더 처리 및 데이터 무결성 관련 백엔드 로직 오류를 탐지하도록 설계된 미디어 서비스 테스트베드입니다.

## 프로젝트 정보
- **ID**: site075
- **포트**: 9184
- **기술 스택**: React, Vite, Express

## 실행 방법
```bash
cd site075
npm install
npm start
```
접속: `http://localhost:9184`

## 의도된 오류 목록
| Bug ID | 유형 | 설명 | 트리거 버튼 |
| :--- | :--- | :--- | :--- |
| `site075-bug01` | http-range-header-misinterpretation | Range 헤더 해석 오류 (구간 재생 이상) | Range 테스트 |
| `site075-bug02` | content-length-mismatch | 콘텐츠 길이 불일치 (스트림 중단) | 스트림 요청 |
| `site075-bug03` | incorrect-mime-type-response | 잘못된 MIME 타입 (재생 실패) | MIME 테스트 |
| `site075-bug04` | chunk-ordering-corruption | 청크 순서 뒤섞임 (오디오 깨짐) | chunk 재생 테스트 |

## PPO 학습 포인트
- HTTP Range 헤더의 정합성 검증
- 응답 헤더(Content-Length, Content-Type)와 실제 바디 데이터의 일치 여부 판별
- 스트리밍 데이터의 시퀀스 순서 및 무결성 감시
- 미디어 플레이어의 재생 상태와 네트워크 요청 간의 상관관계 분석
