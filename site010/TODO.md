# site010 - Development Checklist

## 실행 여부: 완료 (9909 포트 구동 및 /api/health 검증 완료)

---

## 🛠️ 기능 구현 및 설정
- [x] React + Vite 프로젝트 구조화
- [x] Express 백엔드 `server.js` 개발
- [x] UI 디자인 스타일링 (따뜻한 화이트 + 오렌지 + 브라운 계열)
- [x] React 뷰 컴포넌트 개발 (Top Header Bar, Main Dashboard, User Switcher, Dev Debug Mode)
- [x] Express에서 React 정적 빌드 파일 서빙 테스트 (`npm run build` && `npm start`)
- [x] `/api/health` 헬스체크 API 구현

---

## 🐛 의도된 취약점 구현 및 연동 (Reflected XSS)
- [x] **site010-bug01** (SEC-091) : 반사형 XSS (검색창)
- [x] **site010-bug02** (SEC-092) : 반사형 XSS (프로필 소개)
- [x] **site010-bug03** (SEC-093) : 반사형 XSS (문의 폼)
- [x] **site010-bug04** (SEC-094) : 반사형 XSS (맛집 이름)
- [x] **site010-bug05** (SEC-095) : 반사형 XSS (사진 설명)
- [x] **site010-bug06** (SEC-096) : 반사형 XSS (리뷰 댓글)
- [x] **site010-bug07** (SEC-097) : 반사형 XSS (예약 메모)
- [x] **site010-bug08** (SEC-098) : 반사형 XSS (장바구니)
- [x] **site010-bug09** (SEC-099) : 반사형 XSS (결제 폼)
- [x] **site010-bug10** (SEC-100) : 반사형 XSS (필터 파라미터)
