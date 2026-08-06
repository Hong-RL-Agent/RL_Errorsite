# VoteSquare (site078_온라인투표의견관리_선택지마감상태불일치)

온라인 투표, 의견 수렴 및 결과 분석 웹 애플리케이션

## 🏗️ 디렉토리 및 프로젝트 구조

```
site078_온라인투표의견관리_선택지마감상태불일치
├─ frontend (React + Vite, Port: 5178)
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
├─ backend (Node.js + Express, Port: 9577)
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

- **Backend (Express API)**: `http://localhost:9577`
- **Frontend (React + Vite)**: `http://localhost:5178`

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

- **투표 안건 목록 및 상세 조회**: 15개 이상의 사내 투표 안건(복지/근태, IT/기술, 조직문화) 조회 및 실시간 개표 현황 확인.
- **선택지별 SVG 개표 그래프**: 각 안건별 옵션의 득표수 및 득표율 가시화.
- **투표 참여 및 취소**: 35개 이상의 참여 내역 관리 및 25개 이상의 투표 의견 댓글 작성.
- **투표 생성 및 마감 제어**: 새로운 투표 안건 생성 및 마감 처리.

---

## ⚠️ 의도적으로 삽입된 복합 오류 목록

1. **Frontend + Backend 요청 순서 충돌**
   - 투표 선택지를 수정한 직후(3초 지연 완료) 투표를 마감(0.1초 완료)하면, 마감 API는 먼저 완료되고 3초 뒤 완료되는 선택지 수정 API 내부에 이전 구형 선택지가 동봉 저장되어 새로고침 시 투표는 마감 상태이고 선택지는 이전 값으로 돌아갑니다.

2. **Backend + JSON DB 결과 불일치**
   - 투표 참여를 취소해도 참여자 목록에서는 삭제되지만, 결과 그래프와 총 참여자 수에는 계속 포함되며 data.json 안에서도 votes 배열과 statistics 객체가 서로 불일치합니다.

3. **Frontend 정렬 후 잘못된 대상 선택**
   - 투표 목록을 참여자순으로 정렬한 뒤 투표하기 버튼을 누르면 화면상의 정렬 인덱스를 원본 투표 배열에 대입하여 클릭한 투표가 아니라 정렬 전 배열의 같은 index 투표 id로 참여가 저장됩니다.

4. **Backend 상태 역전 오류**
   - 투표 마감 직후 댓글을 수정(4초 지연 완료)하면, 마감 상태인데도 늦게 도착한 댓글 수정 API가 투표 상태를 다시 `OPEN`(진행중)으로 바꿔버려 목록에서는 마감, 상세에서는 진행중으로 표시됩니다.

5. **Network stale response 오류**
   - 카테고리 필터('WELFARE' 3초 지연 ➔ 'TECH' 0.2초 완료)를 고속 변경하면 오래된 응답이 최신 목록을 덮어써 중앙 목록은 오래된 결과, 오른쪽 미리보기는 최신 투표 결과로 서로 불일치합니다.

6. **Session + Cache 잔존 오류**
   - 사용자 A가 참여한 투표 목록을 본 뒤 사용자 B로 로그인하면 목록은 B 기준으로 바뀌지만 상단 참여 완료 개수와 최근 투표 결과는 A 캐시가 남아 노출됩니다.

7. **Backend 중복 요청 오류**
   - 중복 투표 요청 시 HTTP 409 Conflict를 반환하지만, 투표 감사 로그(`voteLogs`)에는 중복 참여 기록이 저장되어 감사를 왜곡합니다.

---

## 🧪 테스트 시나리오

1. **Error 1 테스트**: 우측 패널에서 선택지 문구를 수정하고 `⚡ 선택지 수정 & 마감` 버튼 클릭 ➔ 3초 후 새로고침 시 투표는 마감 상태이나 선택지는 구형 문구로 롤백됨을 확인.
2. **Error 2 테스트**: 중앙 실시간 참여자 대장에서 `🗑️ 취소` 버튼 클릭 ➔ 참여자 표에서는 지워지나 개표 그래프 및 totalVoters 수치는 유지됨을 확인.
3. **Error 3 테스트**: 좌측 사이드바에서 `참여자 많은순` 정렬 선택 ➔ 목록의 투표하기 클릭 시 엉뚱한 index 안건에 참여 저장됨을 확인.
4. **Error 4 테스트**: 우측 패널에서 댓글 내용 수정 ➔ 4초 후 백엔드가 마감된 투표 상태를 `OPEN`으로 역전시킴을 확인.
5. **Error 5 테스트**: 좌측 카테고리 필터를 `복지/근태` 클릭 직후 `IT/기술` 클릭 ➔ 3초 후 늦은 응답이 덮어쓰는 불일치 확인.
6. **Error 6 테스트**: 상단 로그인 투표자를 `유저 A`에서 `유저 B`로 변경 ➔ 상단 KPI 통계가 유저 A 데이터로 잔존함을 확인.
7. **Error 7 테스트**: 우측 패널에서 `🚨 중복 투표 요청` 클릭 ➔ HTTP 409 에러 발생하나 서버 logs에는 기록됨을 확인.
