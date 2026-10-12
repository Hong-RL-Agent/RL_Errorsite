# PrefSpace 의도적 기능 오류 명세서 (BUGS.md)

본 문서는 PrefSpace (D-07) 사용자 환경설정 웹 서비스에 설계된 5가지 의도적 기능 오류에 대한 명세서입니다.  
본 환경은 **STATE_REVISIT** 확인 전략을 사용하는 DQN 학습 환경으로, 단순히 저장 직후 즉시 나타나는 오류가 아니라 **저장 직후에는 UI 상에서 성공한 것처럼 보이지만, 이후 브라우저 새로고침(Refresh), 메뉴 탭 재방문(Tab Revisit), 로그아웃 후 재로그인(Re-login)을 수행했을 때 상태 영속성이 깨져 이전 값으로 되돌아가는 현상**을 정밀하게 검증할 수 있도록 구성되어 있습니다.

---

## 1. BUG-D07-01: 다크모드 테마 변경 후 페이지 새로고침 시 라이트모드 복원 오류

- **bug_id**: `BUG-D07-01`
- **오류명**: 특정 사용자(`user_alex`)에서 다크모드 테마로 변경 저장 후 브라우저 새로고침 시 이전 라이트모드로 원복되는 오류
- **확인전략**: `STATE_REVISIT`
- **대상 계정**: `user_alex` (ID: 1, 알렉스 김)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - `user_alex`의 초기 테마는 `light`.
- **상태 전이 추적 (State Transition)**:
  - **저장 전 값 (Pre-Save Value)**: `theme = 'light'`
  - **사용자 변경 값 (User Input Value)**: `theme = 'dark'`
  - **저장 직후 값 (Post-Save Value in UI)**: `theme = 'dark'` (성공 토스트 알림 노출 및 다크 스타일 즉시 반영)
  - **재방문 후 값 (Revisit Value)**: `theme = 'light'` (페이지 새로고침 F5 실행 시 라이트모드로 복원됨)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 계정 드롭다운에서 `user_alex` 선택 (또는 `user_alex`로 로그인).
  2. 좌측 메뉴에서 [화면 테마 및 디스플레이] (`theme`) 탭 선택.
  3. [다크 모드] 카드를 클릭하여 선택 (`data-option-theme="dark"`).
  4. 하단 [테마 설정 저장] 버튼 클릭 (`PATCH /api/preferences`).
  5. "화면 테마 설정이 성공적으로 저장되었습니다" 메시지 확인 (화면이 어두운 다크 테마로 변경됨).
  6. 브라우저 새로고침 (F5 또는 페이지 Reload) 수행.
  7. 다시 로드된 화면의 테마 및 선택 카드가 [라이트 모드]로 되돌아가 있는지 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 새로고침 후 화면 배경이 밝은 라이트 모드로 복원되고 [라이트 모드] 카드가 활성화됨.
  - **DOM**: `div[data-theme-container]`의 `data-selected-theme` 값이 `'light'`로 복원됨 (`document.body.classList`에 `theme-dark` 미포함).
  - **Network**: 새로고침 시 호출된 `GET /api/preferences?userId=1`의 응답 JSON `data.preferences.theme`가 `'light'`.
  - **State**: SQLite `SELECT theme FROM user_preferences WHERE user_id = 1` 결과가 `'light'`.

---

## 2. BUG-D07-02: 언어 설정 변경 후 재로그인 시 기존 언어 복원 오류

- **bug_id**: `BUG-D07-02`
- **오류명**: 특정 사용자(`user_sarah`)에서 언어 설정을 한국어에서 영어로 변경 저장 후 로그아웃 및 재로그인 시 한국어로 복구되는 오류
- **확인전략**: `STATE_REVISIT`
- **대상 계정**: `user_sarah` (ID: 2, 사라 이)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - `user_sarah`의 초기 언어는 `ko`.
- **상태 전이 추적 (State Transition)**:
  - **저장 전 값 (Pre-Save Value)**: `language = 'ko'`
  - **사용자 변경 값 (User Input Value)**: `language = 'en'`
  - **저장 직후 값 (Post-Save Value in UI)**: `language = 'en'` (드롭다운에 English 선택 및 성공 토스트 노출)
  - **재방문 후 값 (Revisit Value)**: `language = 'ko'` (로그아웃 후 재로그인 시 한국어로 복구됨)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 계정 드롭다운에서 `user_sarah` 선택 (로그인).
  2. 좌측 메뉴에서 [언어 및 다국어 지원] (`language`) 탭 선택.
  3. 언어 선택 드롭다운에서 `English (United States)` 선택 (`language = 'en'`).
  4. 하단 [언어 설정 저장] 버튼 클릭 (`PATCH /api/preferences`).
  5. "언어 및 지역 설정이 성공적으로 저장되었습니다" 메시지 확인 (드롭다운에 English 표시).
  6. 상단 헤더의 [로그아웃 / 재로그인] 버튼 클릭 -> 재로그인 모달에서 `user_sarah` 선택 후 [선택한 계정으로 로그인] 클릭.
  7. 로그인 완료 후 [언어 및 다국어 지원] 탭을 확인했을 때 드롭다운이 `한국어 (Korean)`로 복구되어 있는지 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 재로그인 후 언어 드롭다운에 `한국어 (Korean)`가 선택되어 있음.
  - **DOM**: `select[data-language-select]`의 `value`가 `'ko'`.
  - **Network**: 재로그인 시 호출된 `POST /api/auth/login` 응답 페이로드의 `data.preferences.language`가 `'ko'`.
  - **State**: SQLite `SELECT language FROM user_preferences WHERE user_id = 2` 결과가 `'ko'`.

---

## 3. BUG-D07-03: 마케팅 알림 OFF 변경 후 메뉴 재방문 시 ON 복원 오류

- **bug_id**: `BUG-D07-03`
- **오류명**: 특정 사용자(`user_david`)에서 마케팅 이메일 알림을 OFF로 끄고 저장 후 다른 메뉴로 이동했다가 재방문 시 다시 ON으로 복원되는 오류
- **확인전략**: `STATE_REVISIT`
- **대상 계정**: `user_david` (ID: 3, 데이비드 박)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - `user_david`의 초기 `email_marketing`은 `1` (ON).
- **상태 전이 추적 (State Transition)**:
  - **저장 전 값 (Pre-Save Value)**: `email_marketing = true` (스위치 ON)
  - **사용자 변경 값 (User Input Value)**: `email_marketing = false` (스위치 OFF)
  - **저장 직후 값 (Post-Save Value in UI)**: `email_marketing = false` (스위치 OFF 상태 유지 및 성공 토스트 노출)
  - **재방문 후 값 (Revisit Value)**: `email_marketing = true` (타 메뉴 이동 후 알림 탭 재방문 시 다시 스위치 ON으로 켜짐)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 계정 드롭다운에서 `user_david` 선택.
  2. 좌측 메뉴에서 [이메일 및 푸시 알림] (`notifications`) 탭 선택.
  3. [마케팅 및 프로모션 이메일 알림] 항목의 토글 스위치를 클릭하여 OFF로 해제.
  4. 하단 [알림 설정 저장] 버튼 클릭 (`PATCH /api/preferences`).
  5. "알림 환경설정이 성공적으로 저장되었습니다" 메시지 확인 (스위치가 꺼진 상태 유지).
  6. 좌측 메뉴에서 [개인 프로필 설정] (`profile`) 탭을 클릭하여 다른 화면으로 이동.
  7. 다시 좌측 메뉴에서 [이메일 및 푸시 알림] (`notifications`) 탭을 클릭하여 재방문.
  8. 마케팅 이메일 알림 토글 스위치가 다시 파란색 ON으로 켜져 있는지 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 재방문 후 마케팅 이메일 알림 스위치가 파란색 활성(ON) 상태로 복구되어 있음.
  - **DOM**: `input[data-switch="email-marketing"]`의 `checked` 프로퍼티가 `true`.
  - **Network**: 재방문 시 호출된 `GET /api/preferences?userId=3` 응답의 `data.preferences.email_marketing`이 `1`.
  - **State**: SQLite `SELECT email_marketing FROM user_preferences WHERE user_id = 3` 결과가 `1`.

---

## 4. BUG-D07-04: 개인정보 공개범위 변경 후 탭 재방문 시 이전 공개범위 복원 오류

- **bug_id**: `BUG-D07-04`
- **오류명**: 특정 사용자(`user_elena`)에서 개인정보 공개 범위를 '비공개(PRIVATE)'로 변경 저장 후 다른 메뉴를 거쳐 재방문 시 '전체 공개(PUBLIC)'로 복원되는 오류
- **확인전략**: `STATE_REVISIT`
- **대상 계정**: `user_elena` (ID: 4, 엘레나 최)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - `user_elena`의 초기 `privacy_scope`는 `'PUBLIC'`.
- **상태 전이 추적 (State Transition)**:
  - **저장 전 값 (Pre-Save Value)**: `privacy_scope = 'PUBLIC'`
  - **사용자 변경 값 (User Input Value)**: `privacy_scope = 'PRIVATE'`
  - **저장 직후 값 (Post-Save Value in UI)**: `privacy_scope = 'PRIVATE'` (비공개 라디오 카드 선택 및 성공 알림)
  - **재방문 후 값 (Revisit Value)**: `privacy_scope = 'PUBLIC'` (타 탭 이동 후 재방문 시 전체 공개로 복원됨)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 계정 드롭다운에서 `user_elena` 선택.
  2. 좌측 메뉴에서 [개인정보 공개 범위] (`privacy`) 탭 선택.
  3. [완전 비공개 (Private)] 라디오 카드를 클릭하여 선택 (`privacy_scope = 'PRIVATE'`).
  4. 하단 [공개 범위 설정 저장] 버튼 클릭 (`PATCH /api/preferences`).
  5. "개인정보 공개 범위가 성공적으로 저장되었습니다" 메시지 확인 (비공개 카드 파란색 테두리 활성).
  6. 좌측 메뉴에서 [개인 프로필 설정] (`profile`) 탭 클릭.
  7. 다시 좌측 메뉴에서 [개인정보 공개 범위] (`privacy`) 탭 클릭하여 재방문.
  8. 선택된 카드가 비공개가 아닌 [전체 공개 (Public)] 카드로 원복되어 있는지 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 재방문 후 [전체 공개 (Public)] 카드가 활성화되어 있음.
  - **DOM**: `div[data-privacy-container]`의 `data-current-privacy` 값이 `'PUBLIC'` (`input[data-privacy-option="PUBLIC"]`가 checked).
  - **Network**: 재방문 시 호출된 `GET /api/preferences?userId=4` 응답의 `data.preferences.privacy_scope`가 `'PUBLIC'`.
  - **State**: SQLite `SELECT privacy_scope FROM user_preferences WHERE user_id = 4` 결과가 `'PUBLIC'`.

---

## 5. BUG-D07-05: 시간대 변경 후 페이지 새로고침 시 이전 시간대 복원 오류

- **bug_id**: `BUG-D07-05`
- **오류명**: 특정 사용자(`user_james`)에서 표준 시간대를 'America/New_York'으로 변경 저장 후 브라우저 새로고침 시 'Asia/Seoul'로 복원되는 오류
- **확인전략**: `STATE_REVISIT`
- **대상 계정**: `user_james` (ID: 5, 제임스 정)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - `user_james`의 초기 `timezone`은 `'Asia/Seoul'`.
- **상태 전이 추적 (State Transition)**:
  - **저장 전 값 (Pre-Save Value)**: `timezone = 'Asia/Seoul'`
  - **사용자 변경 값 (User Input Value)**: `timezone = 'America/New_York'`
  - **저장 직후 값 (Post-Save Value in UI)**: `timezone = 'America/New_York'` (드롭다운에 뉴욕 시간대 표시 및 성공 알림)
  - **재방문 후 값 (Revisit Value)**: `timezone = 'Asia/Seoul'` (브라우저 새로고침 시 대한민국 표준시로 복구됨)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 계정 드롭다운에서 `user_james` 선택.
  2. 좌측 메뉴에서 [표준 시간대 (Timezone)] (`timezone`) 탭 선택.
  3. 시간대 드롭다운에서 `미국 동부 표준시 (America/New_York - GMT-05:00)` 선택.
  4. 하단 [시간대 설정 저장] 버튼 클릭 (`PATCH /api/preferences`).
  5. "표준 시간대 설정이 성공적으로 저장되었습니다" 알림 확인 (드롭다운 및 안내 문구에 America/New_York 표시).
  6. 브라우저 새로고침 (F5 또는 Reload) 수행.
  7. 시간대 드롭다운 값이 `대한민국 표준시 (Asia/Seoul - GMT+09:00)`로 복구되어 있는지 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 새로고침 후 드롭다운 선택 값이 `대한민국 표준시 (Asia/Seoul)`로 복원됨.
  - **DOM**: `select[data-timezone-select]`의 `value`가 `'Asia/Seoul'`.
  - **Network**: 새로고침 시 호출된 `GET /api/preferences?userId=5`의 `data.preferences.timezone`이 `'Asia/Seoul'`.
  - **State**: SQLite `SELECT timezone FROM user_preferences WHERE user_id = 5` 결과가 `'Asia/Seoul'`.
