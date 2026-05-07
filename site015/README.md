# Lumina Learning - site015

## 개요
이 프로젝트는 온라인 강의 수강 플랫폼(Online Learning Platform)으로, PPO 에이전트 훈련을 위한 5가지 백엔드 비즈니스 로직 오류 및 다크 패턴이 포함된 테스트 환경입니다. 화이트와 블루 계열의 깔끔한 교육 플랫폼 UI가 적용되어 있습니다.

## 사이트 정보
- **사이트 이름**: Lumina Learning
- **사이트 ID**: site015
- **포트 번호**: 9124
- **기술 스택**: React, Vite, Express, Tailwind CSS

## 실행 방법
```bash
cd site015
npm install
npm start
```
서버가 시작되면 브라우저에서 `http://localhost:9124`로 접속하십시오.

## 필수 API 엔드포인트
- `GET /api/health`: 서버 상태 반환 (항상 정상 응답)
- `GET /api/courses`: 전체 강의 카탈로그 반환
- `POST /api/course/start`: 특정 강의 수강 시작
- `POST /api/course/progress`: 특정 강의의 수강 진도율 업데이트
- `POST /api/course/complete`: 특정 강의 완료 처리
- `GET /api/user/courses`: 사용자의 현재 수강 중인 강의 및 완료 목록 반환
- `GET /api/user/export`: 사용자 학습 이력 데이터 다운로드 반환

## 정상 작동 기능
- 모든 강의 목록(Catalog) 조회
- 개별 강의 수강 시작(Start) 및 대시보드 등록
- 수강 중인 강의 진도율(Progress) 저장 및 UI 바 업데이트
- 강의 완료 시 완료된 수료증(Certificates) 목록으로 이동
- 정상적인 네트워크 통신 중 로딩 및 에러 상태 표시

## 의도된 백엔드 오류 (5개)

1. **bugId: site015-bug01**
   - **유형**: `data-hostage-lockin`
   - **설명**: 사용자 데이터 이동성을 막기 위해, 학습 데이터 Export 시 의도적으로 완료된 강의(completedCourses)를 락(Lock) 처리하여 다운로드 받지 못하게 함.
   - **트리거**: "학습 데이터 다운로드" 버튼 클릭 (`[data-bug-id="site015-bug01"]`)

2. **bugId: site015-bug02**
   - **유형**: `non-idempotent-api`
   - **설명**: 수강 시작 API의 멱등성이 파손되어, 같은 강의의 수강 시작을 여러 번 누르면 Dashboard에 같은 강의가 무한히 중복 생성됨.
   - **트리거**: 강의 카탈로그 카드 내 "중복 수강 시작 테스트" 버튼 클릭 (`[data-bug-id="site015-bug02"]`)

3. **bugId: site015-bug03**
   - **유형**: `forced-api-call`
   - **설명**: 진도율 검증 로직이 누락되어, API만 호출하면 진도율이 0%여도 강제로 100% 완료 처리됨.
   - **트리거**: 대시보드 진행 카드 내 "강제 완료 처리" 버튼 클릭 (`[data-bug-id="site015-bug03"]`)

4. **bugId: site015-bug04**
   - **유형**: `user-agent-discrimination`
   - **설명**: 모바일 기기(또는 특정 환경)에서 접속 시 차별적으로 고급/프리미엄 강의를 카탈로그에서 숨김.
   - **트리거**: 카탈로그 섹션의 "모바일 요청 테스트" 버튼 클릭 (`[data-bug-id="site015-bug04"]`)

5. **bugId: site015-bug05**
   - **유형**: `browser-version-curse`
   - **설명**: 특정 브라우저(예: Chrome 100 이상)에서 접속 시 대시보드 응답 데이터 구조를 파괴하여 제목을 "null"로, 진도율을 "NaN"으로 반환함.
   - **트리거**: 대시보드 섹션 상단의 "[브라우저 버전 테스트]" 텍스트 클릭 (`[data-bug-id="site015-bug05"]`)

## PPO 에이전트 기대 행동
- **bug01**: Export된 JSON 페이로드 구조를 분석하여 정당한 사용자의 데이터(완료 목록)가 부당하게 배제/Lock 처리되는 다크 패턴 식별.
- **bug02**: 동일 요청(수강 시작) 반복 시 서버 상태 응답 배열의 길이가 계속 비정상적으로 늘어나는 멱등성 파손 감지.
- **bug03**: 선행 제약(진도율 100%) 없이 후속 상태(완료)로 전이되는 비즈니스 로직 우회 취약점 식별.
- **bug04**: User-Agent나 접속 헤더 변경에 따라 동일 엔드포인트의 리소스 항목 수(배열 길이)가 차등/차별 제공되는 편향성 탐지.
- **bug05**: 특정 클라이언트 버전 정보 헤더 주입 시 반환 데이터의 스키마 손상(null, NaN)을 발생시키는 종속성 결함 파악.

## 안내 문서
- 각 버그에 대한 상세 스펙 및 응답 예시는 `BUGS.md`를 참고하십시오.
- 프로젝트 구현 및 진행 현황은 `TODO.md`에 정리되어 있습니다.

## 배포 시 주의사항
- 본 서버는 Mock 데이터를 메모리 배열에 저장하므로 재시작 시 상태가 초기화됩니다.
- PPO 검증 목적이므로 외부 DB나 실제 OAuth 로그인 등의 외부 API 의존성은 포함하지 않아야 합니다.
