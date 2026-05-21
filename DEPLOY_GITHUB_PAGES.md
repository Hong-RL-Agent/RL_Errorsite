# GitHub Pages Deployment

이 배포는 `frontend-errorsite` 기준 에러사이트를 GitHub Pages에서 열 수 있도록 만든 정적 산출물입니다. 현재 작업 브랜치는 `deploy-frontend-pages`이고, `deploy-frontend-pages`는 작업용 브랜치 이름일 뿐 URL 경로명으로 사용하지 않습니다.

배포 산출물은 `docs/frontend-errorsite/siteXXX/` 형식입니다. 원본 사이트 폴더명에는 의도된 오류 설명이 포함되어 있으므로 rename하지 않았고, 각 원본 폴더의 `dist` 결과만 짧은 배포 경로로 복사합니다.

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

## API 처리

GitHub Pages에서는 Express 서버와 `/api`가 동작하지 않습니다. 그래서 production 빌드에서만 프론트엔드 mock API를 설치합니다. 로컬 개발은 기존처럼 각 사이트의 Vite 포트와 Express 서버 포트로 실행하면 됩니다.

이번 1차 범위의 mock 적용:

- `site001`: `/api/books/bestsellers`, `/api/books/recommended`, `/api/genres`, `/api/books/search`, `/api/cart`
- `site002`: `/api/cities`, `/api/hotels`
- `site003`: `/api/user`, `/api/stats/weekly`, `/api/routines`
- `site004`: `/api/categories`, `/api/announcements`, `/api/courses`
- `site005`: `/api/categories`, `/api/restaurants`

의도된 버튼 무반응, 중복 렌더링, 모바일 겹침, undefined 표시, 차트 overflow, 조건부 렌더링 누락, 뱃지 불일치, 드롭다운 잘림 버그와 `data-bug-id`는 유지합니다.

## 로컬 확인

GitHub Pages 배포본은 포트가 아니라 `/frontend-errorsite/site001/` 같은 경로로 접속합니다. 로컬에서는 다음처럼 `docs`를 정적 서버로 열어 확인합니다.

```bash
python -m http.server 8080 -d docs
```

확인 경로:

- `http://localhost:8080/`
- `http://localhost:8080/frontend-errorsite/site001/`
- `http://localhost:8080/frontend-errorsite/site002/`

다른 브랜치 배포 결과와 섞이지 않도록 이번 산출물은 `docs/frontend-errorsite/` 아래에만 둡니다.

## 자동화

기본 범위는 `site001`~`site005`입니다.

```bash
node scripts/build-pages.mjs
```

나중에 사용자가 확인한 뒤 범위를 늘릴 때는 명시적으로 지정합니다.

```bash
node scripts/build-pages.mjs --sites=site001,site002,site003,site004,site005
```
