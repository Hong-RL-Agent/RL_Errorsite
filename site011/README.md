# AI Document Search & Analysis Platform (site011)

## 개요
- **사이트 이름**: AI DocAnalyzer
- **사이트 ID**: site011
- **포트 번호**: 9120
- **기술 스택**: React + Vite + Express
- **주제**: RAG 기반 문서 질의응답 및 분석 플랫폼

본 사이트는 PPO 에이전트가 AI 시스템에서 발생할 수 있는 데이터 정밀도, 컨텍스트 관리, 메모리 성능 등의 고급 백엔드 오류를 탐지하도록 설계되었습니다.

## 실행 방법
```bash
cd site011
npm install
npm start
```

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `POST /api/rag/query`: 문서 기반 질문 및 답변 생성
- `GET /api/docs/mixed-types`: 다양한 타입의 문서 목록 조회
- `GET /api/stats/large-number`: 시스템 통계 데이터(큰 숫자) 조회
- `GET /api/system/gc`: 시스템 GC 상태 확인
- `GET /api/system/memory`: 메모리 사용량 모니터링

## 정상 작동 기능 목록
- AI 질의응답 기능 (키워드 기반 검색 및 응답)
- 시스템 리소스 실시간 모니터링 UI
- 문서 매핑 리스트 조회
- 시스템 상태 로그 출력
- 리셋 기능을 통한 시스템 초기화

## 의도된 백엔드 오류 5개 (UI에서 빨간색 버튼으로 표시)
1. **site011-bug01 (rag-context-truncation)**: 긴 컨텍스트 처리 시 정보 누락으로 인한 오답 생성. `data-bug-id="site011-bug01"`
2. **site011-bug02 (polymorphic-mapping-error)**: 문서 타입 간 구조 불일치로 인한 데이터 누락. `data-bug-id="site011-bug02"`
3. **site011-bug03 (json-precision-loss)**: 큰 숫자 처리 시 정밀도 소실로 인한 데이터 왜곡. `data-bug-id="site011-bug03"`
4. **site011-bug04 (gc-stop-the-world)**: 의도적 지연을 통한 시스템 일시 정지 현상. `data-bug-id="site011-bug04"`
5. **site011-bug05 (offheap-memory-leak)**: 가상의 메모리 누수 발생으로 인한 리소스 점유 증가. `data-bug-id="site011-bug05"`

## PPO 에이전트 탐지 기대 행동
- AI 답변의 일관성 및 정확성 저하 식별
- 데이터 구조 내 Null 값 및 타입 불일치 탐지
- 수치 데이터의 정밀도 오류 감지
- 응답 시간 지연 및 리소스 사용량 증가 트렌드 분석

## 배포 시 주의사항
- 실제 AI 모델(LLM)을 사용하지 않는 시뮬레이션 환경입니다.
- 포트 9120이 열려 있어야 합니다.
