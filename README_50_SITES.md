# RL_Errorsite — 50 Additional Intentional-Error Sites

이 패키지는 기준 샘플 `RL_Error_Test_error-site-v1` 이후 추가 제작한 50개 학습/평가용 오류 사이트입니다.

## 범위

- 사이트: `error-site-v02` ~ `error-site-v51` (총 50개)
- Frontend: React + Vite
- Backend: Node.js + Express
- DB: Node.js `node:sqlite`
- 권장 실행 환경: Node.js 24 이상
- 사이트당 의도적 오류: 7~8개
- 총 배정 오류 인스턴스: 390개
- vulnerability family: 13종, 각 30회씩 분배

## 디렉터리

- `sites/`: GitHub에 올릴 50개 결과물
- `docs/sites_manifest_v1.json`: 50개 사이트 설계 및 오류 배정 기준
- `docs/phase1_50_site_master_plan.xlsx`: 사람이 보기 쉬운 전체 계획/배정표
- `docs/security_error_reward_policy.csv`: 팀 제공 정책 원본
- `tools/`: 재생성·검증용 스크립트

## 각 사이트 공통 전달물

각 `sites/error-site-vXX/`에는 다음이 있습니다.

- `frontend/`
- `backend/`
- `README.md`
- `BUGS.md`
- `bug_catalog.json`
- `site_meta.json`
- `.gitignore`

`README.md`에는 실행 방법, 테스트 계정, 데이터 초기화 방법이 포함되어 있습니다.
`BUGS.md` / `bug_catalog.json`에는 오류별 재현 범위(UI/API), 재현 조건, 정상 동작, 의도적 오류 동작, oracle/evidence가 정리되어 있습니다.

## 공통 테스트 계정

- 사용자 A: `userA@test.com` / `1234`
- 사용자 B: `userB@test.com` / `1234`
- 관리자: `admin@test.com` / `1234`

## reward / safe_fixture

- reward 기준은 사이트별로 구현하지 않고 팀 지시대로 RAWD 학습 측에서 처리합니다.
- `safe_fixture` 값은 정책 원본과 각 사이트의 `BUGS.md` / `bug_catalog.json`에 유지합니다.

## Git 관리

`node_modules`, `frontend/dist`, SQLite 런타임 DB는 결과물에 포함하지 않았으며 각 사이트 `.gitignore`에서도 제외합니다.


## 최종 검증

- 구조/문서 자동검증: **50/50 PASS**
- 사용자 Windows/Node 24 full-stack smoke test: **error-site-v02 PASS**
- 대표 5개 backend/bug-fixture runtime 검증: **5/5 PASS, 40 checks, 13/13 family coverage**
- 상세 결과: `docs/FINAL_VALIDATION_REPORT.md`

GitHub에는 ZIP 파일 자체보다 `sites/error-site-v02` ~ `sites/error-site-v51`의 소스 폴더를 저장소에 추가하는 방식을 권장합니다.
