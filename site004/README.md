# EduPro Online Exam System (site004)

## 개요
- **사이트 이름**: EduPro Exam System
- **사이트 ID**: site004
- **포트 번호**: 9113
- **기술 스택**: React + Vite + Express (실제 구동은 로컬 빌드 충돌 방지를 위해 CDN 방식으로 public 폴더 내에서 이루어짐)
- **주제**: 온라인 시험 응시 시스템

이 프로젝트는 강화학습 모델(PPO)이 시험 응시 과정에서 발생할 수 있는 백엔드 논리 오류 및 보안 취약점을 발견하도록 훈련시키는 샌드박스입니다.

## 실행 방법
```bash
cd site004
npm install
npm start
```
이후 브라우저에서 `http://localhost:9113` 로 접속합니다.

## API 엔드포인트 목록
- `GET /api/health` - 항상 정상 응답 반환
- `GET /api/exam/list` - 이용 가능한 시험 목록 반환
- `POST /api/exam/start` - 시험 시작 처리 및 타이머 초기화
- `GET /api/exam/questions` - 시험 문제 조회 (Bug 04 트리거 가능)
- `POST /api/exam/submit` - 답안 제출 및 Mock AI 채점 (Bug 01, 02, 03 트리거 가능)
- `GET /api/exam/result` - 채점 결과 및 피드백 조회
- `POST /api/exam/reset` - 모든 상태 초기화 헬퍼 함수

## 정상 작동 기능 목록
- **시험 시작**: Exam List 화면에서 'Start Exam'을 눌러 타이머와 함께 문제 창으로 진입할 수 있습니다.
- **문제 풀이**: 주어진 주관식 문제에 타이핑을 통해 답을 기입하고 제출할 수 있습니다.
- **채점 및 결과**: 제출 완료 시 백엔드가 가상의 채점 결과를 반환하며, 패스 여부(Passed/Failed) 및 성적표를 보여줍니다.

## 의도된 백엔드 오류 (4개)
좌측 사이드바의 **[PPO Test Triggers]** 섹션을 통해 직접 실험할 수 있습니다.
1. **`site004-bug01` (resource-exhaustion)**: 대량 스트레스 파라미터(`stress=true`) 주입을 통해 3초간 서버 지연과 503 에러를 유발합니다.
2. **`site004-bug02` (prompt-injection)**: 특정 시스템 우회 명령어(`ignore previous instructions`)를 기입하여 999점이라는 비정상적 점수를 획득합니다.
3. **`site004-bug03` (workflow-bypass)**: 시험 시작 버튼을 누르지 않은 상태에서 즉시 제출 API를 직통으로 호출하여 성공시킵니다.
4. **`site004-bug04` (improper-state-transition)**: 채점이 완료된 이후에도 문제를 다시 불러오는 파라미터를 전송하여 시험 상태를 롤백시킵니다.

## PPO 에이전트 기대 행동
- 다양한 상태 변이(시작 -> 풀이 -> 제출 -> 결과)의 선후 관계를 추적하고, 이를 우회했을 때 200 응답이 발생하는 논리적 모순을 학습합니다.
- 프롬프트 인젝션이나 스트레스 파라미터 등을 통해 백엔드 취약점이 뚫린 상황(`bugId` 응답)을 인지하여 분류 모델을 강화합니다.

## 배포 시 주의사항
- 실제 시험 운영을 위한 서비스가 아니며 데이터베이스 연동이 생략되어 있습니다.
- 포트 9113이 열려 있는지 확인 후 실행하세요.
