# site090 - ConfigMaster Testbed

PPO(Proximal Policy Optimization) 에이전트의 설정 관리 로직 결함 탐지 능력을 향상시키기 위한 고충실도 웹 애플리케이션 테스트베드입니다.

## 📌 주요 주제
**다크모드 및 사용자 설정 프로필 시스템**

## 🏗️ 기술 스택
- **Frontend**: React + Vite + Lucide-React
- **Backend**: Express (Node.js)
- **Styling**: Vanilla CSS (Modern Dashboard UI)

## 🐛 탐지 대상 결함 (Bugs)
1. **Bug 01 (기본값 오버라이드 실패)**: 프로필 명칭 변경 시 기본값 정책에 의해 변경 사항이 무시됨.
2. **Bug 02 (설정 우선순위 충돌)**: 시스템 소스 요청 시 사용자 설정과 충돌하여 비정상 데이터 반환.
3. **Bug 03 (Feature Toggle 미반영)**: 다크모드 활성화 명령 후에도 UI 엔진이 테마를 전환하지 않음.
4. **Bug 04 (설정 초기화 누락)**: 초기화 요청 후 일부 사용자 메타데이터가 초기화되지 않고 유지됨.

## 🚀 시작하기
```bash
cd site090
npm install
npm start
```
포트 `9199`에서 대시보드가 실행됩니다.
