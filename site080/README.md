# News Cache Master - 뉴스 캐싱 테스트 플랫폼 (site080)

이 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 HTTP 캐싱 전략, ETag 정합성, 그리고 조건부 요청 처리의 결함을 탐지하도록 설계된 전문 테스트 환경입니다.

## 🚀 실행 방법
```bash
cd site080
npm install
npm start
```
- **접속 주소**: http://localhost:9189

## 🔍 프로젝트 정보
- **포트**: 9189
- **기술 스택**: React + Vite + Express
- **주요 기능**: 뉴스 피드 조회, 실시간 캐시 상태 모니터링, ETag 검증 도구

## ❗ 의도된 백엔드 오류 (4개)

1. **site080-bug01 (etag-mismatch)**
   - **트리거**: "뉴스 피드 동기화" 버튼 클릭
   - **설명**: 동일 데이터임에도 매번 다른 ETag를 생성하여 캐시 효율을 저하시킴.

2. **site080-bug02 (conditional-request-ignore)**
   - **트리거**: "브라우저 캐시 최적화 확인" 버튼 클릭
   - **설명**: `If-None-Match` 헤더를 무시하고 304 응답 대신 항상 200 응답을 보냄.

3. **site080-bug03 (cache-invalidation-failure)**
   - **트리거**: "속보 긴급 업데이트" 후 "통계 새로고침" 클릭
   - **설명**: 새 데이터가 추가되어도 캐시된 통계값이 갱신되지 않음.

4. **site080-bug04 (stale-data-return)**
   - **트리거**: 특정 뉴스 상세 페이지 반복 조회
   - **설명**: 데이터가 수정되었음에도 캐시 만료 처리가 되지 않아 과거 데이터를 반환함.

## 📡 API 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/news`: 전체 뉴스 목록 및 ETag 반환
- `POST /api/news`: 새 뉴스 등록
- `GET /api/news/:id`: 뉴스 상세 정보 (Stale 데이터 반환 가능)
- `GET /api/cache/status`: 캐시 적중률 및 통계
- `GET /api/logs`: 서버 로그 확인

## 🤖 PPO 탐지 목표
- ETag의 일관성 및 재사용성 검증
- 데이터 갱신 시 캐시 무효화(Invalidation) 로직 확인
- HTTP 304 Not Modified 조건부 요청의 정상 처리 여부 식별
- 캐시 TTL 만료 후 데이터 신선도(Freshness) 검증
