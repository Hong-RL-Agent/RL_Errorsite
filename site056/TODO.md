# TODO - site056 Museum Audio Guide

## 1. 프로젝트 기반 설정
- [x] `site056` 폴더 생성 및 초기화
- [x] `package.json` 스크립트 및 `express` 설치
- [x] Express 서버(`server.js`) 및 API 엔드포인트 구현 (Artifacts, Audio Tracks)

## 2. 디자인 및 레이아웃 (Premium Museum)
- [x] 아이보리 & 딥브라운 테마의 고급 박물관 UI 디자인
- [x] 히어로 섹션 및 갤러리 탭 메뉴 구현
- [x] 하단 고정 오디오 플레이어 UI 설계
- [x] 우측 "현재 선택한 작품" Sticky 패널 및 지도 가이드 구현

## 3. 핵심 기능 구현 (Vanilla JS)
- [x] API 데이터 페칭 및 전시관별 트랙 리스트 렌더링
- [x] 작품 검색 및 갤러리 탭 전환 기능
- [x] 작품 상세 정보 모달 연동
- [x] 오디오 재생 제어 로직 (Mock 데이터 연동)
- [x] 미구현 기능에 대한 "준비 중입니다" alert 연동

## 4. 의도된 GUI 오류 주입
- [x] `site056-bug01`: 트랙 리스트 중복 렌더링 오류 구현 (app.js)
- [x] `site056-bug02`: 하단 플레이어로 인한 리스트 하단 덮임 레이아웃 오류 (styles.css)
- [x] `site056-bug03`: 특정 트랙 재생 버튼 무반응 이벤트 오류 (app.js)
- [x] 각 오류 지점에 `data-bug-id` 및 주석 추가

## 5. 최종 검증 및 문서화
- [x] `BUGS.md` 작성 및 오류 명세 기록
- [x] `README.md` 작성 및 프로젝트 안내
- [x] `npm start` 실행 및 전체 기능/오류 테스트 완료
