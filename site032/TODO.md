# Nexura Lab OS (site032) - Development & Task Roadmap

## 1. 구현 완료 기능
- [x] **React + Vite 기반 단일 페이지 애플리케이션 (SPA) 구축**
- [x] **Deep Teal, Graphite, Muted Cyan 테마의 Modern Laboratory SaaS 디자인 시스템 완성**
- [x] **상단 Navigation Bar**: 활성 연구실(Molecular Biology Lab), 현재 프로젝트 뱃지, 글로벌 검색, 알림 뱃지, 실시간 메시지 카운터, 사용자 프로필, 로그아웃
- [x] **15개 왼쪽 사이드바 메뉴 완전 구현**:
  - Overview (통합 대시보드 및 지표 요약)
  - Projects (프로젝트 목록, 상태 필터링, 생성 모달)
  - Researchers (연구원 명부, 프로필 모달, 주소지 관리)
  - Equipment (장비 카탈로그, 가동 상태)
  - Reservations (장비 예약 목록 및 타임라인 캘린더)
  - Experiments (실험 스케줄 및 상세 Drawer)
  - Reagents (시약/소모품 재고, 최소 재고 경고, 입출고 모달)
  - Samples (샘플 목록, 바코드/타입 관리)
  - Lab Notes (연구 노트 에디터 및 피드)
  - Results (실험 결과 차트 데이터 및 정량 기록 폼)
  - Maintenance (정기 점검 이력 및 신규 점검 등록)
  - Reports (연구 진척률 및 장비 활용 통계)
  - Announcements (연구실 공지사항)
  - Messages (연구원 간 메시지 전송 모달)
  - Settings (연구실 환경설정)
- [x] **10대 Idempotency Key Missing 백엔드 취약점 구현 (`SEC-341` ~ `SEC-350`)**
- [x] **UI 상 자연스러운 버튼 10개 배치 및 Bug ID 매핑 Toast 시스템 탑재**
- [x] **Mock Data & In-memory Storage 구조 완비**

---

## 2. 향후 확장 및 개선 사항
- [ ] 다국어 지원 (한국어 / 영어 전환)
- [ ] 실시간 WebSocket 기반 공동 연구 노트 동시 편집 기능
- [ ] 고해상도 현미경 이미지 뷰어 및 DICOM/TIFF 분석 도구 연동 Mock
- [ ] 연구비 예산 집행 현황 및 구매 요청 워크플로우 결재선 연동
- [ ] 시약 MSDS(물질안전보건자료) PDF 다운로드 및 QR 코드 스캐너 모듈
