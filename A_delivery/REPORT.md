# GitHub 제출 최종 점검

2026-10-08 최종 정리. 실행 코드는 변경하지 않았으며, 기존 자동 테스트 결과와 소스·문서·제작 자료를 재대조했습니다. 통과한 애플리케이션 테스트는 불필요하게 다시 실행하지 않았습니다.

## A 담당 필수 조건 비교

| 항목 | PDF 필수 조건 | 실제 결과 | 판정 |
|---|---|---|---|
| A 담당 사이트 구성 | PDF 3쪽의 A-01~A-10 도메인·기술·용도 | 배정된 10개 도메인 모두 일치 | 충족 |
| React / Next.js | React 5개 / Next.js 5개 | React/Vite 5개, 실제 Next.js App Router 5개 | 충족 |
| 오류 수 | 사이트당 4~6개 | 각 4개, 총 40개 | 충족 |
| Training 확인전략 | ACTION 4사이트 / SEQUENCE 2사이트 / REVISIT 1사이트 | A-01~04 AR 각각4개 / A-05~06 SR 각각4개 / A-07 RV4개 | 충족 |
| Validation / Unseen | Validation 1 / Unseen 2, 세 전략 혼합 | A-08 AR2+SR1+RV1 / A-09·10 AR1+SR2+RV1 | 충족 |
| 실제 API·분리 구조 | Frontend와 Backend 분리 및 실제 요청 | Frontend 9511~9520 → 별도 Express 9411~9420 | 충족 |
| DB 저장·재방문 | 필요 상태 DB 저장 | 사이트별 SQLite, 정상 저장·reload·Backend 재시작 검사 통과 | 충족 |
| 초기화 | episode별 reset 제공 | 모든 사이트 POST /api/test/reset + 처음부터 버튼 | 충족 |
| 정상 기능·반복 재현 | 정상 기능 포함, 동일 조건에서 deterministic | 정상 기능 검사10개; 오류40개 각각 초기화 후2회 재현 | 충족 |
| 오류 문서·선정 근거 | 필수9개 정보 및 엑셀 Evidence·Oracle·Precondition 참고 | 각 bug_catalog의 정보 및 원본 No/메타데이터40개 재대조 완료 | 충족 |
| 제외 전략 | OBSERVATION / SECURITY / LOAD / CONCURRENT 제외 | 선정0개; AR/SR/RV만 사용 | 충족 |
| 학습·평가 분리 | Validation/Unseen은 학습·replay·reward에서 제외 | manifest·DB·JSON Evidence 분리; training/reward 허용 플래그 분리 | 충족 |
| 다양성·정답 노출 방지 | UI/DOM/버튼/API/흐름 차별화, 답을 드러내는 이름 금지 | 공통 최소 셸/CSS는 재사용, 업무 컴포넌트·좌석지도·게시판·표·단계폼·API 경로 분리; DOM의 data-bug-id 등 없음 | 충족 |

PDF 근거: 제작 가이드 2쪽 공통조건, 3쪽 A 담당 배정, 6쪽 Validation/Unseen 분리. 엑셀 전략_정의와 전체_분류의 DQN_학습대상·필요_Evidence·Confirmation_Oracle·실행조건_Precondition을 원본과 다시 대조했습니다. STATE_REVISIT의 조건부 항목은 저장→재방문→상태 비교가 실제 통과한 fixture에 한해 사용했습니다.

## 사이트별 오류 및 실행 주소

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

## 실제 테스트 결과

| 검사 | 결과 |
|---|---|
| 의도된 오류 40개 × 초기화 후2회 | 80회 모두 PASS |
| 정상 저장·재방문 기능 | 10사이트 PASS |
| DB·사건로그 reset | 10사이트 PASS |
| Backend 재시작 후 SQLite 보존 | 10사이트 PASS |
| React/Next.js 프로덕션 빌드 | 10사이트 PASS |
| 프로덕션 접속·API 프록시·UI reset/폼 초기화 | 10사이트 PASS |

PASS는 의도된 오류의 재현·확인 성공을 뜻합니다. 앱의 의도된 오류를 수정했다는 뜻이 아닙니다. 기존 테스트 실행 시각과 자세한 결과는 verification/final-summary.json 및 나머지 요약 파일에 보존했습니다. 이번 정리의 정적 검사 기록은 verification/requirements-audit.json입니다.

## 설치·실행·검증

Node.js 24 이상. ZIP을 푼 A_delivery에서 실행합니다.

```powershell
npm ci
npm start -- A-01 A-02
# 10개 동시 실행: npm start
# 프로덕션: npm run build 후 npm start -- --production
```

사이트 종료 후 `npm test -- --split all`은 전체 QA를 실행합니다. 기본 `npm test`는 Training만 검사합니다. Edge가 없으면 설치된 Chrome을 BROWSER_CHANNEL=chrome으로 지정하세요. `node tests/durability.mjs`는 DB 재시작 검증입니다. 자세한 명령·reset·별도 Frontend/Backend 실행은 README.md를 참고하세요.

## 제출 파일 및 미완료 항목

제출 ZIP: submissions/A_delivery_submission_2026-10-08.zip (저장소 루트 기준). 압축 내부 최상위 A_delivery/를 기존 저장소 최상위로 복사하여 기존90개 사이트와 나란히 추가합니다. 필요한 소스·설정·의존성 lock·오류 문서·테스트·JSON 검증 기록을 포함하고 node_modules·캐시·DB·빌드 결과·임시 자료는 제외합니다. DB는 첫 실행에서 자동 생성됩니다.

요청된 로컬 사이트 제작·검증·제출 정리 범위의 미완료 항목: 없음. 외부 배포 및 RAWD 학습기 연결·학습 실행은 범위 밖입니다. 학습기의 입력은 catalogs/training/manifest.json만 사용해야 합니다.

기존90개 사이트와 실행 소스는 수정하지 않았습니다. GitHub 업로드·push는 수행하지 않았습니다.
