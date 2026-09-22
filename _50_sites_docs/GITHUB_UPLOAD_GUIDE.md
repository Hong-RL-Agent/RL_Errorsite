# GitHub 업로드 가이드

팀장이 지정한 `RL_Errorsite` 저장소에 **압축파일 자체를 커밋하지 말고**, 이 패키지의 사이트 폴더들을 저장소 루트에 추가하는 것을 권장합니다.

## 업로드 대상

- `error-site-v02/` ~ `error-site-v51/` — 50개 사이트
- `README_50_SITES.md` — 이번 50개 추가분 설명
- `_50_sites_docs/` — 배정표/정책/최종 검증 자료 (선택이지만 권장)
- `_50_sites_tools/` — 재생성/검증 스크립트 (선택)

기존 저장소의 `README.md`, 기존 `site001...` 등의 파일은 삭제하거나 덮어쓰지 않습니다.

## GitHub Desktop 기준

1. 기존 `RL_Errorsite` 저장소를 GitHub Desktop에서 연다.
2. 이 패키지의 `error-site-v02` ~ `error-site-v51`을 저장소 최상위 폴더에 복사한다.
3. `README_50_SITES.md`와 필요 시 `_50_sites_docs`, `_50_sites_tools`도 복사한다.
4. GitHub Desktop의 Changes에서 `node_modules`, `dist`, `*.sqlite`, `*.db`가 포함되지 않았는지 확인한다.
5. Commit summary 예: `Add 50 intentional-error training sites`
6. Commit 후 `Push origin`한다.

## 팀 전달 시 핵심 문구

- 추가 50개 사이트: `error-site-v02 ~ error-site-v51`
- React/Vite + Express + SQLite 구조
- 사이트당 7~8개 의도적 오류, 총 390개 배정
- 13개 vulnerability family를 각 30회씩 분산
- README/BUGS/bug_catalog에 실행·초기화·재현 범위·정상/오류 동작·oracle/evidence 정리
- reward는 RAWD 측 처리, safe_fixture는 정책 값 유지
- 구조/문서 50개 PASS, 대표 5개 40개 bug-family runtime check PASS
