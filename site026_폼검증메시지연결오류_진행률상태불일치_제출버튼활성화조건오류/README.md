# InsightForm - 스마트한 설문 플랫폼

## 정보
- 사이트 ID: site026
- 포트 번호: 9245
- 기술 스택: React, Vite, Express, Lucide-React

## 실행 방법
1. `cd site026`
2. `npm install`
3. `npm run build`
4. `npm start`
5. http://localhost:9245 접속

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/survey`: 현재 진행 중인 설문 데이터 조회
- `GET /api/templates`: 설문 템플릿 목록 조회

## 정상 기능 목록
- 설문 질문 단계별 이동 (이전/다음)
- 템플릿 카테고리 필터링 및 캐러셀 탐색
- 설문 응답자 정보 입력 및 실시간 유효성 체크 (UI)
- 질문 선택지 클릭 시 선택 상태 시각적 반영
- 우측 실시간 응답 요약 패널

## 의도된 프론트엔드 오류 3개
1. **[site026-bug01] 폼 검증 메시지 연결 오류**: 이메일 에러 메시지와 인풋 필드 간의 aria 연결 누락. (`src/components/RespondentForm.jsx`)
2. **[site026-bug02] 진행률 상태 불일치**: 질문 이동 시 진행률 바가 갱신되지 않고 이전 상태 유지. (`src/components/ProgressBar.jsx`)
3. **[site026-bug03] 제출 버튼 활성화 조건 오류**: 필수 항목 미답변 상태에서 제출 버튼이 활성화됨. (`src/components/SurveyQuestionCard.jsx`)

## PPO 에이전트 기대 행동
에이전트는 폼 검증 시 시맨틱한 연결성(A11Y), 실시간 데이터와 시각적 상태 간의 동기화 여부, 그리고 폼 완료 로직과 인터랙티브 요소(버튼)의 상태 제어 로직을 검증해야 합니다.
