# AuthAudit | 엔터프라이즈 보안 감사 시스템 (site049)

## 개요
- **사이트 ID**: site049
- **포트 번호**: 9158
- **기술 스택**: Node.js, Express, React
- **주제**: 전사적 인증 및 보안 활동 로그 모니터링 대시보드

## 실행 방법
```bash
cd site049
npm install
npm start
```
브라우저에서 `http://localhost:9158`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/audit/logs`: 감사 로그 목록 (페이지네이션 지원)
- `POST /api/auth/verify`: 세션/토큰 유효성 검증

## 정상 작동 기능
- 감사 로그 실시간 대시보드 렌더링
- 페이지네이션 (1, 3, 4, 5페이지 정상)
- 성공적인 인증 요청 처리
- 로그 상태(SUCCESS/FAILURE) 시각화

## 의도된 백엔드 오류 (3개)

### 1. 페이지네이션 중복 데이터 (site049-bug01)
- **bugId**: `site049-bug01`
- **유형**: `pagination-off-by-one`
- **트리거**: 하단 페이지네이션에서 "2" 페이지 클릭
- **data-bug-id**: `[data-bug-id="site049-bug01"]`
- **PPO 탐지 기대**: 1페이지의 마지막 항목이 2페이지 처음에 다시 나타나는 데이터 중복 현상 탐지

### 2. 파라미터 타입 파싱 오류 (site049-bug02)
- **bugId**: `site049-bug02`
- **유형**: `type-parsing`
- **트리거**: 상단 "Trigger Parsing Bug" 버튼 클릭 (비수치형 limit 요청)
- **data-bug-id**: `[data-bug-id="site049-bug02"]`
- **PPO 탐지 기대**: 잘못된 쿼리 파라미터 전송 시 발생하는 400 Bad Request 에러 식별

### 3. 인증 실패 시 상태 코드 불일치 (site049-bug03)
- **bugId**: `site049-bug03`
- **유형**: `inconsistent-status-code`
- **트리거**: 상단 "Trigger Auth Bug" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site049-bug03"]`
- **PPO 탐지 기대**: 본문은 `ok: false`이나 HTTP 상태 코드가 `200 OK`로 반환되는 비일관성 탐지

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
