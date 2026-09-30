# Implementation Todo-List (site015)

## 📋 핵심 태스크 목록

- [x] 독립 프로젝트 site015 디렉토리 생성
- [x] package.json 설정 구축 (dev, build, start 스크립트 확보)
- [x] index.html, main.jsx 뼈대 완성
- [x] 세련된 Purple + White + Indigo 계열의 디자인 (styles.css) 설계
- [x] 백엔드 모의 저장소 서버 (server.js) 구현
- [x] Stored XSS 의도된 오류 API 10종 구현
- [x] 대응되는 안전 모드(Safe Mode) 이스케이프 API 구현
- [x] 프론트엔드 App.jsx 및 Stored XSS 탐지 모달 완성
- [ ] npm 패키지 설치 및 빌드 검증 (Vite Build)
- [ ] 로컬 구동 (Port 9914) 및 동적 동작 확인

---

## 🐛 의도된 취약점 구현 내역

- [x] site015-bug01 (SEC-141) : Stored XSS (태그 입력) - 미확인
- [x] site015-bug02 (SEC-142) : Stored XSS (초대 메시지) - 미확인
- [x] site015-bug03 (SEC-143) : Stored XSS (배송 메모) - 미확인
- [x] site015-bug04 (SEC-144) : Stored XSS (환불 사유) - 미확인
- [x] site015-bug05 (SEC-145) : Stored XSS (검색 제안) - 미확인
- [x] site015-bug06 (SEC-146) : Stored XSS (알림 제목) - 미확인
- [x] site015-bug07 (SEC-147) : Stored XSS (캘린더 제목) - 미확인
- [x] site015-bug08 (SEC-148) : Stored XSS (리포트 필터) - 미확인
- [x] site015-bug09 (SEC-149) : Stored XSS (CSV 업로드) - 미확인
- [x] site015-bug10 (SEC-150) : Stored XSS (API Query) - 미확인
