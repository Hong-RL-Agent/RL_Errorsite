# Connect - site016

## 개요
이 프로젝트는 **소셜 미디어 피드 대시보드(Connect)** 테마를 기반으로 한 PPO 에이전트 훈련 전용 랩(Lab) 환경입니다. 개인정보 보호 및 법적 고지 관련 6가지의 심각한 백엔드 결함을 포함하고 있습니다.
프론트엔드는 정상적인 상용 SNS 플랫폼으로 완벽히 위장되어 있으며, 테스트를 위한 별도의 패널 없이 **일반적인 기능 조작 중 자연스럽게 결함이 트리거**되도록 설계되었습니다.

## 사이트 정보
- **사이트 ID**: site016
- **포트 번호**: 9125
- **기술 스택**: React, Vite, Express, Tailwind CSS

## 실행 방법
```bash
cd site016
npm install
npm start
```
서버 실행 후 브라우저에서 `http://localhost:9125` 접속.

## API 엔드포인트 및 기능
- `GET /api/health` : 서버 상태 확인
- `GET /api/feed` : 소셜 미디어 피드 조회
- `GET /api/user/profile` : 프로필 데이터 조회
- `DELETE /api/user/delete` : 계정 영구 삭제 (오류 라우트)
- `POST /api/user/deactivate` : 계정 비활성화 (데이터 파기 지연 발생)
- `GET /api/user/privacy` : 개인정보 약관 조회
- `GET /api/user/inactive` : 휴면 계정 조회
- `GET /api/trending` : 트렌딩 태그 조회 (정상 기능)

## 의도된 오류 (6개) 및 트리거 방법

**테스트 전용 버튼은 존재하지 않습니다.** 아래의 평범해 보이는 기능들을 누르면 백엔드 오류가 호출되며 화면에 에러 토스트(Toast) 팝업이 뜹니다.

1. **bugId: site016-bug01** (데이터 삭제 경로 부재)
   - **트리거**: 좌측 메뉴 `Settings` 이동 후, 맨 아래 붉은색 **[Delete Account]** 버튼 클릭
   - **설명**: 경로가 없어 404가 발생하며 계정이 지워지지 않음.
   - **DOM**: `[data-bug-id="site016-bug01"]`

2. **bugId: site016-bug02** (부적절한 연령 확인 로직)
   - **트리거**: 메인 피드(`Home`)에서 검은색 블라인드 처리된 **[Age-Restricted Content]** 카드 클릭
   - **설명**: 16세 나이로 요청을 보내지만, 서버가 제한을 무시하고 콘텐츠를 반환함.
   - **DOM**: `[data-bug-id="site016-bug02"]`

3. **bugId: site016-bug03** (데이터 최소 수집 원칙 위반)
   - **트리거**: 좌측 메뉴 **[Profile]** 탭 클릭
   - **설명**: 프로필 데이터 요청 시 주민번호, 패스워드가 통째로 날아오는 치명적 결함 발생.
   - **DOM**: `[data-bug-id="site016-bug03"]`

4. **bugId: site016-bug04** (탈퇴 데이터 파기 지연)
   - **트리거**: 좌측 메뉴 `Settings` 이동 후, 주황색 **[Deactivate Account]** 버튼 클릭
   - **설명**: 탈퇴 상태만 부여할 뿐 실제 민감 데이터를 마스킹하거나 제거하지 않음.
   - **DOM**: `[data-bug-id="site016-bug04"]`

5. **bugId: site016-bug05** (법적 근거 고지 미흡)
   - **트리거**: 좌측 메뉴 `Settings` 이동 후, 최상단 Privacy 영역의 **[View Privacy Policy]** 버튼 클릭
   - **설명**: 법적으로 필수 고지해야 할 개인정보 처리 근거(legalBasis) 항목 누락.
   - **DOM**: `[data-bug-id="site016-bug05"]`

6. **bugId: site016-bug06** (휴면 계정 처리 정책 미고지)
   - **트리거**: 좌측 메뉴 `Settings` 이동 후, Account Status 영역의 **[Check Inactive Status]** 버튼 클릭
   - **설명**: 휴면 데이터의 구체적인 파기 일정이나 정책이 누락됨.
   - **DOM**: `[data-bug-id="site016-bug06"]`

## 안내 문서
- 각 버그에 대한 상세 HTTP 상태 및 응답 페이로드는 `BUGS.md`를 참고하십시오.
- PPO 탐지 에이전트는 프론트엔드의 화려한 UI에 속지 않고, 네트워크로 오가는 비정상적인 페이로드와 정책 위반 요소를 감지해야 합니다.
