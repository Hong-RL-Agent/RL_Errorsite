# Implementation Todo-List (site013)

## 📋 핵심 태스크 목록

- [x] 독립 프로젝트 site013 디렉토리 생성
- [x] package.json 설정 구축 (dev, build, start 스크립트 확보)
- [x] index.html, main.jsx 뼈대 완성
- [x] 크림 + 그린 + 화이트 컬러의 당근마켓풍 디자인 (styles.css) 설계
- [x] 백엔드 모의 저장소 서버 (server.js) 구현
- [x] Stored XSS 의도된 오류 API 10종 구현
- [x] 대응되는 안전 모드(Safe Mode) 이스케이프 API 구현
- [x] 프론트엔드 App.jsx 및 Stored XSS 탐지 모달 완성
- [x] npm 패키지 설치 및 빌드 검증 (Vite Build)
- [x] 로컬 구동 (Port 9912) 및 동적 동작 확인

---

## 🐛 의도된 취약점 구현 내역

- [x] site013-bug01 (SEC-121) : Stored XSS (검색창) - 미확인
- [x] site013-bug02 (SEC-122) : Stored XSS (프로필 소개) - 미확인
- [x] site013-bug03 (SEC-123) : Stored XSS (문의 폼) - 미확인
- [x] site013-bug04 (SEC-124) : Stored XSS (상품명 필드) - 미확인
- [x] site013-bug05 (SEC-125) : Stored XSS (파일 설명) - 미확인
- [x] site013-bug06 (SEC-126) : Stored XSS (댓글 입력) - 미확인
- [x] site013-bug07 (SEC-127) : Stored XSS (예약 메모) - 미확인
- [x] site013-bug08 (SEC-128) : Stored XSS (장바구니) - 미확인
- [x] site013-bug09 (SEC-129) : Stored XSS (결제 폼) - 미확인
- [x] site013-bug10 (SEC-130) : Stored XSS (필터 파라미터) - 미확인
