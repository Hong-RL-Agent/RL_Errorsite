# GitHub Pages Deployment

이 배포는 `frontend-errorsite` 기준 에러 사이트를 GitHub Pages에서 열 수 있도록 만든 정적 산출물입니다. 현재 작업 브랜치는 `deploy-frontend-pages`이고, `deploy-frontend-pages`는 작업용 브랜치 이름일 뿐 URL 경로명으로 사용하지 않습니다.

배포 산출물은 `docs/frontend-errorsite/siteXXX/` 형식입니다. 원본 사이트 폴더명에는 의도된 오류 설명이 포함되어 있으므로 rename하지 않았고, 원본 폴더의 `siteXXX` prefix만 배포 경로 번호로 사용했습니다.

## GitHub Pages 설정

1. Repository Settings로 이동합니다.
2. Pages로 이동합니다.
3. Build and deployment를 선택합니다.
4. Source: Deploy from a branch
5. Branch: `deploy-frontend-pages` 또는 나중에 merge 후 `frontend-errorsite`
6. Folder: `/docs`
7. Save

## 예상 URL

- `https://hong-rl-agent.github.io/RL_Errorsite/`
- `https://hong-rl-agent.github.io/RL_Errorsite/frontend-errorsite/site001/`
- `https://hong-rl-agent.github.io/RL_Errorsite/frontend-errorsite/site002/`
- `https://hong-rl-agent.github.io/RL_Errorsite/frontend-errorsite/site003/`

GitHub Pages 배포본은 포트가 아니라 `/frontend-errorsite/siteXXX/` 같은 경로로 접속합니다. `docs/deploy-frontend-pages/` 또는 `docs/site001/` 같은 경로는 사용하지 않습니다.

## 배포 결과

- 전체 탐색 사이트: `site001`부터 `site090`까지 90개
- 성공: 90개
- 실패: 없음
- 제외: 없음
- 배포 목록과 API mock 상세: `docs/BUILD_REPORT.md`

## API 처리

GitHub Pages에서는 Express 서버와 `/api`가 동작하지 않습니다. `scripts/build-pages.mjs`는 각 사이트의 `server.js`에서 정적 GET 응답을 추출할 수 있는 경우 `docs/frontend-errorsite/siteXXX/api/...` 파일로 복사하고, 해당 사이트의 `index.html`에 `pages-mock.js`를 주입해 `fetch('/api/...')`를 상대 경로 API 파일로 연결합니다.

mock은 GitHub Pages 렌더링을 위한 최소 대체입니다. 추천 카드 중복, API 지연, 버튼 무반응, 모바일 겹침, 필터/정렬/폼 오류 등 의도된 오류는 정상화하지 않았고, `data-bug-id`도 변경하지 않았습니다.

mock 적용 사이트와 route 목록은 `docs/BUILD_REPORT.md`의 `API Mock Routes` 섹션을 기준으로 확인합니다.

## Vite base

Vite 사이트는 GitHub Pages 하위 경로에서도 asset 경로가 깨지지 않도록 `base: './'`를 보장했습니다. 기존 `server.proxy` 설정은 로컬 개발용이므로 삭제하지 않았습니다. Vite 설정이 없는 Vite 사이트에는 최소 `vite.config.js`를 생성했습니다.

## 로컬 확인

로컬 개발은 기존처럼 각 사이트의 포트로 실행하면 됩니다. GitHub Pages 배포본은 다음처럼 `docs`를 정적 서버로 열어 확인합니다.

```bash
python -m http.server 8080 -d docs
```

확인 경로:

- `http://localhost:8080/`
- `http://localhost:8080/frontend-errorsite/site001/`
- `http://localhost:8080/frontend-errorsite/site006/`
- `http://localhost:8080/frontend-errorsite/site090/`

## 자동화

전체 사이트 빌드:

```bash
node scripts/build-pages.mjs --all
```

범위 지정 빌드:

```bash
node scripts/build-pages.mjs --from site006 --to site090
```

일부 사이트만 빌드:

```bash
node scripts/build-pages.mjs --sites=site001,site002,site003
```

스크립트는 root의 `siteXXX` 원본 폴더명을 변경하지 않고, 빌드 성공 시 결과만 `docs/frontend-errorsite/siteXXX/`로 복사합니다. 실패한 사이트가 있으면 다음 사이트를 계속 처리하고 `docs/BUILD_REPORT.md`에 실패 원인을 남깁니다.
