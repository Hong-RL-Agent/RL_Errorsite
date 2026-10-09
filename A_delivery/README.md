# A 담당 RAWD DQN 웹사이트 10개

기존 site001~site090과 planning 원본은 수정하지 않았습니다. 모든 신규 코드와 실행 산출물은 이 폴더에 있습니다.

## 설치 및 처음 실행

Node.js 24 이상과 npm을 준비하세요. ZIP을 풀면 최상위에 `A_delivery/` 폴더가 있습니다. 이 폴더 전체가 하나의 npm workspace 프로젝트입니다. 특정 A-xx 폴더만 따로 옮기면 공통 Backend와 shared 모듈이 누락됩니다.

처음 받은 컴퓨터에서 저장소 위치에 맞춰 실행합니다.

```powershell
cd "<RL_Errorsite 저장소 경로>\A_delivery"
npm ci
npm start -- A-01 A-02
```

`npm ci`는 포함된 package-lock.json으로 의존성을 설치합니다. SQLite 패키지나 별도 DB 설치는 필요 없습니다. DB와 초기 데이터는 첫 Backend 실행에서 자동 생성됩니다. 웹사이트를 실행하는 데 Python이나 원본 PDF/엑셀은 필요 없습니다.

## 현재 작업 폴더에서 빠른 실행

현재 작업 컴퓨터에는 의존성이 설치되어 있습니다.

```powershell
cd "C:\Users\Owner\Desktop\오류\RL_Errorsite\A_delivery"
npm start -- A-01 A-02
```

사이트 번호를 생략하면 10개가 모두 실행됩니다. 메모리 사용을 줄이려면 학습 시 필요한 사이트만 지정하세요. 종료는 해당 터미널에서 Ctrl+C입니다.

| 사이트 | 용도 | 기술 | 확인전략 | 프런트엔드 | Backend |
|---|---|---|---|---|---|
| A-01 쇼핑몰 | Training | React/Vite | ACTION_REPLAY | http://127.0.0.1:9511 | 9411 |
| A-02 게시판 | Training | Next.js | ACTION_REPLAY | http://127.0.0.1:9512 | 9412 |
| A-03 강의 신청 | Training | React/Vite | ACTION_REPLAY | http://127.0.0.1:9513 | 9413 |
| A-04 음식 주문 | Training | Next.js | ACTION_REPLAY | http://127.0.0.1:9514 | 9414 |
| A-05 숙소 예약 | Training | React/Vite | SEQUENCE_REPLAY | http://127.0.0.1:9515 | 9415 |
| A-06 여행 일정 | Training | Next.js | SEQUENCE_REPLAY | http://127.0.0.1:9516 | 9416 |
| A-07 프로필 관리 | Training | React/Vite | STATE_REVISIT | http://127.0.0.1:9517 | 9417 |
| A-08 도서 대여 | Validation | Next.js | 세 전략 혼합 | http://127.0.0.1:9518 | 9418 |
| A-09 티켓 예매 | Unseen Test | React/Vite | 세 전략 혼합 | http://127.0.0.1:9519 | 9419 |
| A-10 공연 예약 | Unseen Test | Next.js | 세 전략 혼합 | http://127.0.0.1:9520 | 9420 |

각 폴더의 `npm run api`는 Backend만, `npm run dev`는 Frontend만 실행합니다. 처음 다른 컴퓨터로 옮겼을 때는 A_delivery에서 `npm ci`를 실행하세요.

## 사이트별 구현 오류

AR = ACTION_REPLAY, SR = SEQUENCE_REPLAY, RV = STATE_REVISIT. Training은 AR 4개 사이트 / SR 2개 사이트 / RV 1개 사이트, Validation과 Unseen Test는 세 전략을 모두 포함합니다.

| 사이트 | 용도 | 기술 | AR / SR / RV 오류 수 | 접속 주소 | Backend |
|---|---|---|---|---|---|
| A-01 쇼핑몰 | training | React | 4 / 0 / 0 | http://127.0.0.1:9511 | 9411 |
| A-02 게시판 | training | Next.js | 4 / 0 / 0 | http://127.0.0.1:9512 | 9412 |
| A-03 강의 신청 | training | React | 4 / 0 / 0 | http://127.0.0.1:9513 | 9413 |
| A-04 음식 주문 | training | Next.js | 4 / 0 / 0 | http://127.0.0.1:9514 | 9414 |
| A-05 숙소 예약 | training | React | 0 / 4 / 0 | http://127.0.0.1:9515 | 9415 |
| A-06 여행 일정 | training | Next.js | 0 / 4 / 0 | http://127.0.0.1:9516 | 9416 |
| A-07 프로필 관리 | training | React | 0 / 0 / 4 | http://127.0.0.1:9517 | 9417 |
| A-08 도서 대여 | validation | Next.js | 2 / 1 / 1 | http://127.0.0.1:9518 | 9418 |
| A-09 티켓 예매 | unseen-test | React | 1 / 2 / 1 | http://127.0.0.1:9519 | 9419 |
| A-10 공연 예약 | unseen-test | Next.js | 1 / 2 / 1 | http://127.0.0.1:9520 | 9420 |

| 사이트 | 구현 오류 4개 (01 → 04) |
|---|---|
| A-01 | 상품 한 개 담기가 두 개로 처리됨 / 장바구니 항목 삭제 미반영 / 수량 하한 검증 누락 / 찜 대상과 저장 대상 불일치 |
| A-02 | 소식 중복 등록 / 소식 삭제 실패 / 편집 대상 잘못 반영 / 공감 횟수 이중 증가 |
| A-03 | 신청 요청 후 상태 변화 없음 / 수강 취소 미반영 / 강의 신청 중복 처리 / API 응답과 실제 신청 내역 불일치 |
| A-04 | 메뉴 추가 이중 처리 / 주문 메뉴 제외 실패 / 할인이 할증으로 적용됨 / 주문 전송 시 다른 메뉴로 접수 |
| A-05 | 예약 기간 금액 누락 / 선택 해제한 조식 강제 포함 / 확정 실패 후 결제 롤백 누락 / 취소 후 객실 재고 복원 실패 |
| A-06 | 취소한 여행의 이동권 복원 누락 / 취소된 일정의 공개 상태 전이 허용 / 편집 복귀 후 단계 순환 / 여행 취소 보상 누락 |
| A-07 | 표시 이름 저장 후 재방문 시 유실 / 소개 저장 후 재방문 시 유실 / 언어 설정 저장 후 재방문 시 유실 / 소식 수신 설정 저장 후 재방문 시 유실 |
| A-08 | 도서 대출 중복 생성 / 반납 후 연체료 집계 잔존 / 검색 조건 연결 중 저자 필터 유실 / 연장 기한 재방문 시 복원 실패 |
| A-09 | 좌석 선택 요청 미반영 / 해제된 주차 옵션 청구 / 입장권 취소 후 좌석 수 복구 실패 / 수령 방식 재방문 시 유실 |
| A-10 | 동행 인원 이중 증가 / 낮 회차 예약일 불일치 / 초대장 회수 수수료 보상 누락 / 지원 요청 재방문 시 유실 |

자세한 행동 순서·초기 조건·기대/실제 결과·Evidence·Oracle은 각 사이트의 `bug_catalog.json`을 보세요.

## 구조와 최소 구현

- `backend/server.mjs`: 사이트별 독립 프로세스가 사용하는 공통 Express API. 브라우저의 fetch는 Vite proxy 또는 Next.js rewrite를 거쳐 별도 포트 Backend에 도달합니다.
- `backend/seed.mjs`: 고정 초기 데이터. 실제 상태는 Node의 내장 SQLite로 `data/<split>/<site>.sqlite`에 저장합니다. JSON 상태 한 행과 요청 로그 테이블을 사용해 별도 ORM·마이그레이션 작업을 줄였습니다.
- `A-01`~`A-10`: 각 사이트의 별도 React 컴포넌트와 서로 다른 화면 구조·버튼·API 경로·업무 흐름. Next.js 5개는 App Router의 page/layout과 next build/start를 갖춘 실제 프로젝트입니다.
- `shared`: 요청 훅, 기본 화면 요소와 최소 CSS만 공유합니다. 각 사이트의 업무 컴포넌트는 분리되어 있습니다.
- 각 사이트의 `bug_catalog.json`: 오류 4개, 확인전략, precondition, trigger, 정상/오류 결과, Evidence, Oracle, 분류 엑셀 원본 No와 행 번호. 브라우저 코드에서 import하지 않습니다.

기존 site046의 상품 데이터·로컬 SVG, site001의 도서 데이터와 목록/수량 계산 패턴, site005의 음식 메뉴 데이터 및 장바구니 흐름, site011/012의 Express CRUD 구조, 기존 Vite API 프록시 구조를 재사용·변형했습니다. 기존 레이아웃 결함이나 data-bug-id는 가져오지 않았습니다. 무관한 기능과 디자인은 생략했습니다.

## 초기화와 Evidence

각 사이트의 Frontend/Backend 모두 다음 경로로 동일한 API를 호출할 수 있습니다.

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:9511/api/test/reset
```

`POST /api/test/reset`은 해당 사이트 DB 상태·단계 이력·요청 로그·로그 순번을 고정 초기 상태로 복원합니다. 외부 RL episode에서는 API 호출 후 페이지를 reload하세요. 화면의 **처음부터** 버튼은 API 초기화와 페이지 재접속을 함께 수행하여 폼 입력도 초기화합니다. 초기화가 다른 사이트나 split에 영향을 주지 않습니다.

`GET /api/test/state`와 `GET /api/test/events`는 로컬 QA/상태 Evidence 수집용입니다. 오류 정답이나 bug_id는 반환하지 않습니다. DB 파일을 읽지 않고도 저장 전후 상태를 비교할 수 있습니다. 동시에 같은 사이트를 여러 episode에서 조작하면 상태를 공유하므로 episode는 사이트별로 순차 실행하세요.

## Training / Validation / Unseen Test 분리

- `catalogs/training/manifest.json`: A-01~A-07만 포함 (오류 28개). 학습·replay buffer·reward 조정에 허용되는 목록입니다.
- `catalogs/validation/manifest.json`: A-08만 포함 (오류 4개). 학습·reward 조정에 넣지 않습니다.
- `catalogs/unseen-test/manifest.json`: A-09~A-10만 포함 (오류 8개). 학습·replay buffer·reward 조정에 넣지 않습니다.
- DB와 브라우저 테스트 Evidence도 split별 디렉터리에 분리합니다. `test-results`는 QA 산출물이며 정책 학습 입력이 아닙니다.
- 이번 구현은 웹사이트와 검증 도구입니다. RAWD 학습기·reward 계산기는 이 저장소에 추가하지 않았습니다. 연결할 때 training manifest만 사용해야 합니다.

## 검증 실행

실행 중인 사이트를 종료한 뒤 테스트하세요. 테스트가 필요한 서버를 직접 시작하고 종료합니다. 기본 브라우저는 설치된 Microsoft Edge의 헤드리스 모드입니다.

```powershell
npm test -- A-01 A-02
npm test
npm test -- --split validation
npm test -- --split unseen-test
npm test -- --split all
node tests/durability.mjs
npm run build
```

`npm test`의 기본 대상은 Training만입니다. `--split all`은 배포 전 QA 검사이며 학습 실행이 아닙니다. Microsoft Edge가 없고 Chrome이 설치되어 있으면 PowerShell에서 `$env:BROWSER_CHANNEL="chrome"`으로 설정한 뒤 테스트하세요. 브라우저는 자동 테스트에만 필요하며 사이트 설치·실행과 빌드에는 필요하지 않습니다.

오류 테스트의 PASS는 **의도된 오류를 실제 행동으로 확인했다**는 뜻입니다. 각 오류를 초기화 후 두 번 독립 실행하고 초기/최종 상태의 동일성, UI 증상, 실제 HTTP 응답, 페이지 오류 없음 등을 확인합니다. 각 사이트의 정상 저장·재방문 기능과 reset도 별도로 검사합니다.

제출 ZIP의 기존 검증 요약은 `verification/`에, 40개 오류의 JSON 행동·API·UI·상태 증거는 `verification/evidence/<split>/<bug_id>/evidence.json`에 포함했습니다. 원본 스크린샷과 DOM HTML은 용량과 임시 산출물 제외 원칙에 따라 ZIP에 넣지 않았습니다. 테스트를 다시 실행하면 전체 Evidence가 재생성됩니다.

재실행 Evidence는 `test-results/<split>/<bug_id>/`에 행동 순서·API 요청/응답·초기/최종 상태·UI 텍스트·DOM HTML·스크린샷으로 저장됩니다. `durability.json`은 Backend 프로세스 재시작 후 SQLite 상태 보존 검사입니다.

프로덕션 모드도 사용할 수 있습니다.

```powershell
npm run build
npm start -- --production A-01 A-02
```

10개 프로덕션 사이트가 모두 실행 중일 때 `node tests/production-smoke.mjs`로 접속, API 프록시, 화면의 처음부터 버튼과 폼 초기화를 확인할 수 있습니다. 이 검사는 DB를 초기화합니다.

## 제작 자료

기준은 planning의 RAWD DQN 제작 가이드 A 담당 조건과 분류 엑셀 `전략_정의`, `전체_분류`입니다. 채택 항목은 ACTION_REPLAY/SEQUENCE_REPLAY의 DQN=O 및 브라우저 저장·재방문으로 확인 가능하게 구체화한 STATE_REVISIT의 DQN=조건부입니다. OBSERVATION_RECHECK, SECURITY_PROBE, LOAD_FAULT_REPLAY, CONCURRENT_REPLAY는 선정하지 않았습니다.

외부 배포, 실제 결제·이메일 발송, 사용자 인증 및 RAWD 학습 실행은 범위에 포함하지 않았습니다. 로컬 API와 SQLite를 사용하는 격리된 재학습 fixture입니다.


## GitHub 제출 방법

ZIP을 푼 뒤 **기존 RL_Errorsite 저장소 최상위에 `A_delivery/` 폴더 전체를 추가**하세요. 기존 site001~site090과 나란히 두면 됩니다. `A_delivery/A_delivery/`처럼 중첩하거나 개별 A-xx 폴더를 저장소 최상위로 흩어 놓지 마세요.

```text
RL_Errorsite/
├─ site001_.../            기존 파일 유지
├─ ...
├─ site090_.../            기존 파일 유지
├─ planning/              기존 제작 자료 유지
└─ A_delivery/
   ├─ A-01/ ... A-10/     사이트 소스·설정·bug_catalog.json
   ├─ backend/ shared/   공통 API·SQLite 초기 데이터·프런트 공통 모듈
   ├─ catalogs/          split별 학습/검증/Unseen 목록
   ├─ tests/ tools/      검증 스크립트·실행/빌드 스크립트
   ├─ verification/      기존 검증 요약 및 40개 JSON Evidence
   ├─ package.json
   ├─ package-lock.json
   ├─ .gitignore
   ├─ README.md
   └─ REPORT.md
```

GitHub 웹 업로드에서도 ZIP 파일 자체보다 **압축을 푼 A_delivery 내부 파일들을 같은 폴더 구조로** 업로드하세요. `.gitignore`와 package-lock.json도 포함해야 합니다. ZIP은 팀장 전달용 압축본입니다.

ZIP에서 제외한 항목: node_modules, npm 캐시, .next/dist 빌드 결과, 실행 DB/WAL, logs, 임시 test-results, planning_extract, Python 제작/추출 스크립트, 자동 생성 AGENTS.md. 필요한 두 실행/빌드 도구와 세 테스트 스크립트는 포함합니다. 검증 자료는 `verification/`로 별도 보존합니다.

이미 로컬 사이트가 실행 중이면 새 실행·자동 테스트 전에 종료해 포트 중복을 피하세요. 이 최종 정리 작업은 GitHub 업로드나 push를 수행하지 않았습니다.
