# Intentional Bugs for PPO Training (site090)

1. **site090-bug01: 기본값 덮어쓰기 실패 (default-override-failure)**
   - 사용자가 설정을 변경해도 서버가 이를 무시하고 기본값을 계속 반환함.

2. **site090-bug02: 설정 우선순위 충돌 (config-priority-conflict)**
   - 시스템 소스 요청 시 사용자 설정이 아닌 엉뚱한 우선순위 값이 적용됨.

3. **site090-bug03: Feature Toggle 미반영 (feature-toggle-not-applied)**
   - 다크모드 설정을 ON으로 변경해도 UI 반영 로직이 무시됨.

4. **site090-bug04: 설정 초기화 누락 (reset-state-not-cleared)**
   - 초기화 명령 수행 후에도 일부 설정(예: 사용자 프로필명)이 지워지지 않고 잔존함.
