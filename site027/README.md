# Site 027 - TripScape Modern Travel Booking Platform

React + Vite + Express.js기반 감성 여행 & 럭셔리 숙소 예약 플랫폼 웹 애플리케이션입니다.

## 🚀 실행 방법 (Getting Started)

1. 의존성 패키지 설치:
   ```bash
   cd site027
   npm install
   ```

2. 프로젝트 실행:
   ```bash
   npm start
   ```

3. 웹 브라우저 접속:
   ```
   http://localhost:9926
   ```

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 18, Vite, Vanilla CSS Design System
- **Backend**: Node.js, Express
- **State & Data**: In-Memory Mock Database

## 🌟 주요 기능 (Features)

- **대형 여행 검색 히어로**: 출발지/목적지, 체크인/체크아웃 날짜, 인원수 필터링 검색
- **추천 여행지 카드**: 제주, 도쿄, 발리, 파리, 하와이 등 실시간 추천 데스티네이션
- **숙소 및 카테고리별 여행 상품 탐색**: 5성급 호텔, 감성 펜션, 풀빌라, 액티비티 투어
- **여행 상품 상세 및 예약 Drawer**: 상세 정보, 편의 시설, 예약 메모 기입 및 즉시 예약
- **장바구니 및 결제 시스템**: 장바구니 담기, 결제수단 선택 및 예약 완료
- **마이페이지 & 회원 프로필**: 여권 영문명/자기소개 수정, 증빙 파일 설명 등록, 예약 내역 확인
- **리뷰 작성 & 1:1 고객 센터**: 상품 이용 후기 작성 및 1:1 여행 상담 문의

## 📌 Mock 데이터 안내

본 애플리케이션은 시뮬레이션 및 테스트 목적으로 내부 In-Memory Mock Database만 사용하며, 외부 결제/지도/항공 API를 호출하지 않습니다.

## 📡 주요 API 목록 (API Endpoints)

- `GET /api/health` - 서버 헬스 체크
- `GET /api/search` - 여행지 및 숙소 키워드 검색
- `GET /api/products` - 여행 상품 전체 목록 및 필터링 조회
- `GET /api/products/:id` - 단일 여행 상품 상세 정보 조회
- `POST /api/profile` - 사용자 프로필 및 여권 정보 업데이트
- `POST /api/support` - 1:1 고객 문의 접수
- `POST /api/files` - 여행 증빙 서류 파일 정보 등록
- `POST /api/reviews` - 여행 상품 및 숙소 이용 후기 등록
- `POST /api/orders/reservation` - 숙소 및 투어 예약 신청
- `POST /api/cart` - 장바구니 상품 추가
- `GET /api/cart` - 장바구니 목록 조회
- `POST /api/payment` - 예약 결제 승인 요청
- `GET /api/orders` - 전체 예약 구매 내역 조회
