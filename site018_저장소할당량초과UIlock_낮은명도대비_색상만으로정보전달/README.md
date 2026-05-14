# site018: 여행 일정 플래너

## 정보
- 사이트 이름: TripPlanner
- 사이트 ID: site018
- 포트 번호: 9237
- 기술 스택: React, Vite, Express, Vanilla CSS

## 실행 방법
1. `cd site018`
2. `npm install`
3. `npm run build`
4. `npm start`
5. http://localhost:9237 접속

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/trips`: 일정 데이터 목록 조회 (search 쿼리 지원)
- `GET /api/activities`: 추천 액티비티 목록 조회 (city 쿼리 지원)
- `POST /api/trips/save`: 일정 오프라인 저장 모의 엔드포인트

## 정상 기능 목록
- 도시 검색 정상 동작
- 일정 렌더링 및 모달 팝업 열기/닫기
- 추천 액티비티 Carousel 이전/다음 버튼 동작
- 데이터 로딩 시 스피너 표시 및 에러 바운더리 

## 의도된 프론트엔드 오류 3개
1. **[site018-bug01] 브라우저 저장소 할당량 초과 (storage-quota-ui-lock)**: 오프라인 저장 시 가짜 QuotaExceeded 에러가 발생하며, 스피너가 무한 로딩됨.
2. **[site018-bug02] 낮은 명도 대비 (low-contrast-status-text)**: 타임라인 상태 배지의 글자색과 배경색 대비가 낮아 식별 불가.
3. **[site018-bug03] 색상만으로 정보 전달 (color-only-status-indicator)**: 일정 충돌 여부를 텍스트 없이 점 색상으로만 표시함.

## PPO 에이전트 탐지 기대 행동
에이전트는 3가지 의도된 프론트엔드 GUI/UX/접근성 오류(무한 로딩 락, 낮은 명도 대비 텍스트, 색각 이상자를 고려하지 않은 상태 표시)를 식별해야 하며, 정상 동작하는 API 응답 및 렌더링 과정에서 발생하는 정상적인 지연(Loading)을 오류로 오인하지 않아야 합니다.

배포 시 주의사항: 포트 9237 개방 및 Node 환경 구성 필요.
