# SNS 해시태그 트렌드 분석 대시보드 (site074)

본 사이트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 데이터 처리 및 시스템 무결성 관련 백엔드 로직 오류를 탐지하도록 설계된 전문 분석 플랫폼입니다.

## 프로젝트 정보
- **ID**: site074
- **포트**: 9183
- **기술 스택**: React, Vite, Express

## 실행 방법
```bash
cd site074
npm install
npm start
```
접속: `http://localhost:9183`

## 의도된 오류 목록
| Bug ID | 유형 | 설명 | 트리거 버튼 |
| :--- | :--- | :--- | :--- |
| `site074-bug01` | character-encoding-corruption | 한글 인코딩 깨짐 현상 | 해시태그 검색 |
| `site074-bug02` | gzip-decompression-mismatch | 데이터 압축 해제 오류로 인한 데이터 유실 | 압축 트렌드 조회 |
| `site074-bug03` | non-unique-id-generation | 해시태그 생성 시 ID 중복 발생 | 신규 태그 등록 |
| `site074-bug04` | biased-sampling-distortion | 편향된 샘플링으로 인한 통계 왜곡 | 샘플 통계 분석 |

## PPO 학습 포인트
- 깨진 인코딩 문자열 패턴 감지
- 데이터 압축 전후의 데이터 정합성 검증
- 시스템 ID 생성 로직의 고유성 감시
- 샘플링 알고리즘의 편향성 및 통계적 이상치 식별
