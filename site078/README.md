# DevDocs Search Platform (site078)

이 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 검색 엔진 파이프라인의 논리적 취약점을 탐지하고 학습할 수 있도록 설계된 테스트 환경입니다.

## 🚀 실행 방법
```bash
cd site078
npm install
npm start
```
- **접속 주소**: http://localhost:9187

## 🔍 프로젝트 정보
- **포트**: 9187
- **기술 스택**: React + Vite + Express
- **주요 기능**: 기술 문서 통합 검색, 코드 스니펫 탐색, 시스템 통계 대시보드

## ❗ 의도된 백엔드 오류 (4개)

1. **site078-bug01 (tokenizer-split-error)**
   - **트리거**: "ReactJS" 검색
   - **설명**: 단일 키워드를 불필요하게 분리하여 검색 결과 왜곡.

2. **site078-bug02 (inverted-index-missing-entry)**
   - **트리거**: "Node" 검색 또는 시스템 통계 확인
   - **설명**: 실제 문서가 존재함에도 역색인 누락으로 인해 검색 결과가 반환되지 않음.

3. **site078-bug03 (ranking-score-miscalculation)**
   - **트리거**: "async" 검색
   - **설명**: 랭킹 점수 계산 오류로 관련성 없는 문서가 최상단 노출.

4. **site078-bug04 (highlight-offset-mismatch)**
   - **트리거**: "useEffect" 검색
   - **설명**: 하이라이트 오프셋 계산 불일치로 텍스트 강조 위치가 어긋남.

## 📡 API 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/search?q=...`: 문서 검색 (오류 트리거 핵심)
- `GET /api/dashboard/summary`: 인덱스 상태 요약
- `GET /api/popular`: 인기 키워드 목록
- `GET /api/logs`: 시스템 로그 확인

## 🤖 PPO 탐지 목표
- 검색 파이프라인 무결성 검증
- 역색인(Inverted Index) 누락 탐지
- 랭킹 알고리즘 및 가중치 오류 식별
- 텍스트 처리 및 하이라이트 정확성 검증
