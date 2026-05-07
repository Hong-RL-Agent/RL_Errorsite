# site021 - Terminal Storage Management

PPO 강화학습 에이전트의 저장소 할당량(Quota) 및 리소스 관리 로직 결함 탐지를 위한 터미널 스타일 테스트베드입니다.

## 📌 주요 주제
**클라우드 파일 업로드 및 저장 공간 관리 시스템**

## 🏗️ 기술 스택
- **Frontend**: React + Vite (CLI/Terminal UI)
- **Backend**: Express (Node.js)
- **Styling**: Vanilla CSS (Cyberpunk Terminal Theme)

## 🐛 탐지 대상 결함 (Bugs)
1. **Bug 01 (용량 제한 미적용)**: 100MB 제한을 초과하는 업로드 허용.
2. **Bug 02 (공간 미회수)**: 파일 삭제 후에도 `used` 용량 감소 실패.
3. **Bug 03 (누적 계산 오류)**: 총 사용량 합산 시 인위적 오차 발생.
4. **Bug 04 (사용자 격리 실패)**: 다른 사용자의 파일 목록 및 용량이 공유됨.

## 🚀 시작하기
```bash
cd site021
npm install
npm start
```
포트 `9130`에서 터미널 인터페이스가 실행됩니다.
