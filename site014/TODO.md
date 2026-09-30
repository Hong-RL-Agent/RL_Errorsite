# Implementation Todo-List (site014)

## 📋 핵심 태스크 목록

- [x] 독립 프로젝트 site014 디렉토리 생성
- [x] package.json 설정 구축 (dev, build, start 스크립트 확보)
- [x] index.html, main.jsx 뼈대 완성
- [x] 시원하고 깔끔한 Sky Blue + Navy 계열의 디자인 (styles.css) 설계
- [x] 백엔드 모의 저장소 서버 (server.js) 구현
- [x] Stored XSS 의도된 오류 API 10종 구현
- [x] 대응되는 안전 모드(Safe Mode) 이스케이프 API 구현
- [x] 프론트엔드 App.jsx 및 Stored XSS 탐지 모달 완성
- [x] npm 패키지 설치 및 빌드 검증 (Vite Build)
- [x] 로컬 구동 (Port 9913) 및 동적 동작 확인

---

## 🐛 의도된 취약점 구현 내역

- [x] site014-bug01 (SEC-131) : Stored XSS (로그인 폼) - 확인 완료
- [x] site014-bug02 (SEC-132) : Stored XSS (회원가입 폼) - 확인 완료
- [x] site014-bug03 (SEC-133) : Stored XSS (주소 필드) - 확인 완료
- [x] site014-bug04 (SEC-134) : Stored XSS (쿠폰 필드) - 확인 완료
- [x] site014-bug05 (SEC-135) : Stored XSS (정렬 파라미터) - 확인 완료
- [x] site014-bug06 (SEC-136) : Stored XSS (페이지네이션) - 확인 완료
- [x] site014-bug07 (SEC-137) : Stored XSS (파일명 필드) - 확인 완료
- [x] site014-bug08 (SEC-138) : Stored XSS (채팅 입력) - 확인 완료
- [x] site014-bug09 (SEC-139) : Stored XSS (공지사항) - 확인 완료
- [x] site014-bug10 (SEC-140) : Stored XSS (리뷰 입력) - 확인 완료
