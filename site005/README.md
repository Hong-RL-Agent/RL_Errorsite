# TravelMate Planner (site005)

## 개요
- **사이트 이름:** TravelMate Planner
- **사이트 ID:** site005
- **포트 번호:** 9334
- **기술 스택:** Node.js, Express, Vanilla HTML/CSS/JS

## 실행 방법
```bash
cd site005
npm install
npm start
```
서버가 실행되면 브라우저에서 `http://localhost:9334` 로 접속할 수 있습니다.

## API 엔드포인트 목록
- `GET /api/health` - 서버 상태 확인
- `GET /api/destinations` - 추천 여행지 목록 조회
- `GET /api/itinerary/:userId` - 특정 사용자의 여행 일정 조회
- `POST /api/itinerary` - 새 일정 추가
- `GET /api/budget` - 예산 조회
- `POST /api/budget` - 예산 저장

## 정상 작동 기능 목록 (인터랙션)
1. **여행지 목록 조회 및 렌더링**
2. **지역 필터 셀렉트를 이용한 여행지 필터링**
3. **여행지 카드 클릭 시 상세 모달 오픈**
4. **상세 모달 닫기**
5. **탐색 / 내 일정 탭 전환 내비게이션**
6. **날짜, 시간, 장소 입력하여 일정 추가 (POST API)**
7. **사용자 ID 입력하여 다른 사람 일정 불러오기 (GET API)**
8. **예산 숫자 입력 및 서버에 저장 (POST API 및 지연 로딩 UI)**
9. **체크리스트 체크박스 토글 기능**
10. **숙소 정렬 탭 선택 시 피드백 알림 (UI 전용)**
11. **여행 노트 임시 저장 피드백 알림 (UI 전용)**

## 의도된 오류 (3개)
이 프로젝트는 강화학습 모델(PPO) 훈련을 위해 다음 3개의 오류를 포함하고 있습니다.
1. **site005-bug01 (DB 오류):** DB 중복 저장 오류 (일정 추가 시 중복 날짜/장소 검증 누락)
2. **site005-bug02 (네트워크 오류):** 네트워크 응답 지연 (예산 100만원 이상일 때 15초 응답 지연)
3. **site005-bug03 (보안 오류):** IDOR 취약점 (itineraryId 변경으로 타인 일정 무단 열람)

자세한 오류 정보는 `BUGS.md`를 확인하세요.
작업 진행 상태는 `TODO.md`를 참고하세요.
