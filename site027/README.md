# ChefTable - 따뜻한 레시피 커뮤니티

## 정보
- 사이트 ID: site027
- 포트 번호: 9246
- 기술 스택: React, Vite, Express, Lucide-React

## 실행 방법
1. `cd site027`
2. `npm install`
3. `npm run build`
4. `npm start`
5. http://localhost:9246 접속

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/recipes`: 레시피 목록 (difficulty, search 필터 지원)
- `GET /api/chefs`: 인기 셰프 목록 조회

## 정상 기능 목록
- 레시피 키워드 검색
- 조리 시간 필터링
- 레시피 상세 정보 모달 (단계별 조리법)
- 재료 체크리스트 인터랙션
- 우측 "저장한 레시피" 요약 패널

## 의도된 프론트엔드 오류 3개
1. **[site027-bug01] 필터 상태와 결과 목록 불일치**: 난이도 필터링 로직의 상태 불일치. (`src/App.jsx`)
2. **[site027-bug02] 중복 렌더링**: 모달 내 재료 목록 중 특정 항목 중복 표시. (`src/components/RecipeModal.jsx`)
3. **[site027-bug03] 모바일 이미지 오버랩**: 640px 이하에서 이미지와 텍스트 겹침. (`src/styles/responsive.css`)

## PPO 에이전트 기대 행동
에이전트는 상태 업데이트의 동기화 문제, 리스트 렌더링의 정확성(중복), 그리고 반응형 웹 디자인에서의 요소 배치 및 시각적 간섭(Overlap)을 탐지해야 합니다.
