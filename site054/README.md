# MedPoint | 스마트 병원 예약 시스템 (site054)

## 개요
- **사이트 ID**: site054
- **포트 번호**: 9163
- **기술 스택**: Node.js, Express, React
- **주제**: 전문 의료진 검색 및 병동 예약 가능 여부 확인 시스템

## 실행 방법
```bash
cd site054
npm install
npm start
```
브라우저에서 `http://localhost:9163`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/doctors`: 부서별 의료진 목록 조회
- `GET /api/doctors/:id`: 특정 의사 상세 정보 및 진료 일정 조회
- `GET /api/appointments/check`: 특정 병동(VIP 등) 예약 가능 여부 확인

## 정상 작동 기능
- 전문 의료진 카드 리스트 렌더링
- 부서별 필터링 (치과 및 전체 조회 정상)
- 의사 상세 프로필 모달 (정상 의사 데이터)
- 로딩 상태 시각화

## 의도된 백엔드 오류 (3개)

### 1. 진료과목 필터링 논리 오류 (site054-bug01)
- **bugId**: `site054-bug01`
- **유형**: `invalid-filter-logic`
- **트리거**: 리스트 상단 필터에서 "내과 (BUG)" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site054-bug01"]`
- **PPO 탐지 기대**: "내과(Internal)"를 요청했으나 서버가 "치과(Dental)" 데이터를 반환하는 논리적 불일치 탐지

### 2. 일정 정보 참조 오류 (site054-bug02)
- **bugId**: `site054-bug02`
- **유형**: `null-reference`
- **트리거**: "Dr. Mystery" 의사 카드 클릭
- **data-bug-id**: `[data-bug-id="site054-bug02"]`
- **PPO 탐지 기대**: 서버 데이터에 `schedule` 객체가 없는 항목에 접근할 때 발생하는 500 에러 식별

### 3. VIP 병동 조회 타임아웃 (site054-bug03)
- **bugId**: `site054-bug03`
- **유형**: `api-timeout`
- **트리거**: 헤더의 "VIP 병동 예약 확인" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site054-bug03"]`
- **PPO 탐지 기대**: 특정 요청에 대해 의도적으로 발생하는 6초 이상의 지연 및 408 타임아웃 상태 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
