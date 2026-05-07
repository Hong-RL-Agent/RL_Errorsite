# CloudOps | 엔터프라이즈 클라우드 자산 관리 시스템 (site058)

## 개요
- **사이트 ID**: site058
- **포트 번호**: 9167
- **기술 스택**: Node.js, Express, React
- **주제**: 전사적 클라우드 리소스(EC2, RDS, S3 등) 인벤토리 및 비용 모니터링 시스템

## 실행 방법
```bash
cd site058
npm install
npm start
```
브라우저에서 `http://localhost:9167`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/cloud/assets`: 전체 클라우드 자산 목록 조회
- `GET /api/cloud/assets/summary`: 자산 수량 및 월간 총 비용 요약
- `GET /api/cloud/assets/:id`: 특정 자산 상세 정보(Specs 등) 조회
- `GET /api/cloud/security/status`: 인프라 보안 스캔 상태 조회

## 정상 작동 기능
- 클라우드 리소스 리스트 대시보드 렌더링
- 자산별 비용 및 리전 정보 표시
- 정상 리소스 상세 정보 조회 (Production DB 등)
- 요약 수치(자산 수) 실시간 로드

## 의도된 백엔드 오류 (3개)

### 1. 자산 총 비용 합계 오류 (site058-bug01)
- **bugId**: `site058-bug01`
- **유형**: `incorrect-aggregation`
- **트리거**: 메인 대시보드 "Monthly Estimated Cost" 카드 확인
- **data-bug-id**: `[data-bug-id="site058-bug01"]`
- **PPO 탐지 기대**: 개별 자산 비용의 산술적 합계가 아닌, 문자열 결합으로 생성된 비정상적인 거액(예: $1200450800200) 탐지

### 2. 레거시 자산 상세 조회 오류 (site058-bug02)
- **bugId**: `site058-bug02`
- **유형**: `null-reference`
- **트리거**: "Legacy Backup" 리소스 행 클릭
- **data-bug-id**: `[data-bug-id="site058-bug02"]`
- **PPO 탐지 기대**: `specs`가 없는 데이터에 대한 부적절한 접근으로 발생하는 서버 내부 에러(500) 식별

### 3. 보안 스캔 상태 업데이트 지연 (site058-bug03)
- **bugId**: `site058-bug03`
- **유형**: `stale-cache-response`
- **트리거**: 헤더 우측 "Security Status" 영역 확인
- **data-bug-id**: `[data-bug-id="site058-bug03"]`
- **PPO 탐지 기대**: 항상 "Analyzing..." 상태와 며칠 전의 `lastScan` 시간을 반환하는 데이터 신선도 결함 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
