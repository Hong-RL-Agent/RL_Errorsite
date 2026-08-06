# ReturnHub (site084_쇼핑몰반품교환관리_반품상태환불금액불일치)

쇼핑몰 주문 반품, 교환, 환불 상태 관리 포털 웹 애플리케이션

## 🏗️ 디렉토리 및 프로젝트 구조

```
site084_쇼핑몰반품교환관리_반품상태환불금액불일치
├─ frontend (React + Vite, Port: 5184)
│  ├─ package.json
│  ├─ index.html
│  ├─ vite.config.js
│  └─ src
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ index.css
│     ├─ api
│     │  └─ index.js
│     ├─ components
│     │  ├─ Header.jsx
│     │  ├─ Sidebar.jsx
│     │  ├─ CenterSection.jsx
│     │  └─ RightPanel.jsx
│     └─ pages
│        └─ Home.jsx
│
├─ backend (Node.js + Express, Port: 9583)
│  ├─ package.json
│  ├─ server.js
│  ├─ routes
│  │  └─ apiRoutes.js
│  ├─ controllers
│  │  └─ mainController.js
│  ├─ services
│  │  └─ dataService.js
│  └─ data
│     └─ data.json
│
└─ README.md
```

## 🚀 실행 포트 안내

- **Backend API**: `http://localhost:9583`
- **Frontend 화면**: `http://localhost:5184`

### 실행 방법 (서로 다른 터미널)

1. **백엔드 실행**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **프론트엔드 실행**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📋 정상 기능 요약

- **쇼핑몰 주문 반품 조회**: 25개 이상의 상품 반품 요청 사유, 환불 금액, 택배 수거 예정일 조회.
- **교환 신청 접수 관리**: 15개 이상의 상품 교환 신청 옵션 및 처리 상태 관리.
- **고객 1:1 문의 관리**: 20개 이상의 수거 시각, 택배비, 구성품 관련 문의 답변.
- **환불 금액 집계 & 대시보드**: 월별 환불 금액 및 사유별 반품 비율 통계 집계.

---

## ⚠️ 의도적으로 삽입된 복합 오류 목록

1. **Frontend + Backend 요청 순서 충돌**
   - **설명**: 반품 사유를 변경(3초 지연 완료)한 직후 수거 일정을 변경(0.1초 완료)하면, 수거 일정 변경 API는 먼저 성공하지만 3초 뒤 완료되는 사유 변경 API 내부에 이전 수거 일정(`pickupDate`)이 동봉 저장되어 새로고침 시 새 사유와 이전 수거 일정 조합이 저장됩니다.

2. **Backend + JSON DB 상태 충돌**
   - **설명**: 반품 취소(0.5초 완료) 직후 관리자 환불 승인 API를 호출(4초 지연 완료)하면, 반품 취소는 먼저 0.5초 만에 성공하지만 늦게 완료된 환불 승인 요청이 취소된 반품을 다시 'APPROVED'(환불 승인) 상태로 재활성화시킵니다. 주문 상세에서는 반품 취소, 관리자 처리 화면에서는 환불 승인으로 불일치하게 됩니다.

3. **Frontend 정렬 인덱스 오류**
   - **설명**: 반품 목록을 환불금액순으로 정렬한 뒤 승인 버튼을 누르면 UI 알림은 클릭한 주문번호로 표시되나 backend 저장 승인 데이터는 원본 배열의 다른 index 반품건 주문번호로 저장됩니다.

4. **통계 데이터 불일치**
   - **설명**: 반품 요청을 삭제(`DELETE /api/returns/:id`) 처리하여 대장에서 소거하더라도, 상품별 반품률과 월별 환불 금액 통계(`refundStats.totalRefundAmount`) 수치에는 차감되지 않고 계속 유지됩니다.

5. **Network stale response 오류**
   - **설명**: 처리 상태 필터('REQUESTED' 3초 지연 ➔ 'APPROVED' 0.2초 완료)와 반품 사유 필터를 빠르게 변경 시 오래된 응답이 최신 목록을 덮어써 중앙 반품 목록은 오래된 필터 결과, 오른쪽 환불 요약은 최신 필터 기준 데이터로 서로 불일치합니다.

6. **Session + Cache 잔존 오류**
   - **설명**: 관리자 A가 본 반품 상세를 열어둔 상태에서 관리자 B로 로그인하면 반품 목록은 B 권한 기준으로 바뀌지만, 오른쪽 환불 금액, 수거 일정, 처리 메모 캐시(`cachedRefundAmount`, `cachedPickupDateMemo`)는 A 데이터가 남아 노출됩니다.

7. **Backend 권한 로그 오류**
   - **설명**: 권한 없는 직원(role !== 'ADMIN')이 환불 승인 API(`PATCH /api/returns/:id/approve`)를 호출하면 HTTP 403을 반환하지만, 서버 내부 활동 로그에는 '환불 승인 성공 (REFUND APPROVAL SUCCESS - 200 OK)'으로 잘못 기록됩니다.

---

## 🧪 테스트 시나리오

1. **Error 1 테스트**: 우측 패널에서 수거 일자 선택 후 `사유 변경` 클릭 직후 수거 일정 변경 ➔ 3초 후 새로고침 시 사유는 바뀌었으나 수거 일정은 이전 날짜로 롤백됨을 확인.
2. **Error 2 테스트**: 우측 패널에서 `⚡ 반품 취소 후 환불 승인` 클릭 ➔ 0.5초 후 취소 응답 ➔ 4초 후 환불 승인 응답이 완료되며 주문 상세(취소됨)와 관리자 처리 화면(환불 승인) 간 상태 불일치 확인.
3. **Error 3 테스트**: 좌측 사이드바에서 `환불금액높은순` 정렬 선택 ➔ 상단 반품건의 환불 승인 클릭 ➔ UI 알림과 실제 backend DB 저장 주문번호가 상이함을 확인.
4. **Error 4 테스트**: 중앙 반품 대장에서 `🗑️ 삭제` 클릭 ➔ 대장에서는 삭제되나 상품별 반품률 및 월별 환불 금액 수치가 유지됨을 확인.
5. **Error 5 테스트**: 좌측 상태 필터를 `반품 신청` 선택 직후 `환불 승인` 선택 ➔ 3초 후 늦은 이전 결과가 최신 목록을 덮어씀을 확인.
6. **Error 6 테스트**: 상단 로그인 관리자를 `김반품 팀장`에서 `박환불 실장`으로 전환 ➔ 반품 목록은 B로 바뀌나 상단 KPI 환불 예정 금액은 A 데이터로 잔존함을 확인.
7. **Error 7 테스트**: 중앙 탭에서 `🔒 무권한 직원의 환불 승인 시도` 클릭 ➔ UI/API는 HTTP 403 오류 반환 ➔ 백엔드 콘솔 로그에는 SUCCESS (200 OK)로 잘못 작성됨을 확인.
