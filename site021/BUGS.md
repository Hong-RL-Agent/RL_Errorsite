# Intentional Bugs for PPO Training (site021)

1. **site021-bug01: 용량 제한 미적용 (quota-not-enforced)**
   - 설정된 최대 용량(100MB)을 초과하는 파일 업로드 시에도 차단되지 않고 성공함.

2. **site021-bug02: 삭제 후 공간 미회수 (storage-not-reclaimed)**
   - 파일 삭제 API 요청은 성공하나, `used` 용량이 실제 파일 크기만큼 감소하지 않음.

3. **site021-bug03: 누적 용량 계산 오류 (cumulative-size-error)**
   - 파일 업로드 시 총 사용량 합산 로직에서 고정된 오차 또는 잘못된 가중치가 더해짐.

4. **site021-bug04: 사용자 quota 분리 실패 (quota-isolation-failure)**
   - 다른 사용자 ID로 업로드된 파일의 용량이 현재 사용자의 할당량에 합산되어 표시됨.
