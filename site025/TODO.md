# Project Development Checklist: Site025

## 기초 설정
- [x] 프로젝트 폴더 구조 생성
- [x] package.json 구성
- [x] 필수 문서 작성 (README, BUGS, TODO)

## 백엔드 구현 (server.js)
- [x] Express 서버 기본 설정 및 미들웨어
- [x] MBTI 및 궁합 시드 데이터 설계
- [x] 🔴 site025-bug01: 핫 파티션 편중 로직 구현
- [x] 🔴 site025-bug02: 실시간 벡터 파편화 로직 구현
- [x] 🔴 site025-bug03: 검색 블랙아웃 로직 구현
- [x] 🔴 site025-bug04: 부분 집계 오류 로직 구현
- [x] 9134 포트 바인딩 및 정적 파일 서빙 설정

## 프론트엔드 구현 (src/)
- [x] 프리미엄 디자인 시스템 (styles.css) 정의
- [x] MBTI 선택 및 궁합 매칭 UI 구현
- [x] 인기 트렌드 및 실시간 피드 위젯 구현
- [x] 검색 및 상세 모달 인터랙션 구현
- [x] `data-bug-id` 어트리뷰트 버튼 매핑

## 검증 및 배포
- [x] Vite 빌드 테스트
- [x] 9134 포트 정상 동작 확인
- [x] 4가지 백엔드 오류 트리거 확인
- [x] PPO 에이전트 관측 가능성 검토
