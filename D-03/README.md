# FitTrack - 전문 피트니스 운동 기록 & 분석 플랫폼 (D-03)

FitTrack은 헬스, 웨이트 트레이닝, 유산소 운동 루틴을 기록하고 세트, 무게, 반복 횟수 및 주간 볼륨 통계를 한눈에 모니터링할 수 있는 프리미엄 피트니스 대시보드 웹 애플리케이션입니다.  
본 프로젝트는 **Frontend(React + Vite)**와 **Backend(Node.js + Express + SQLite)**가 독립된 폴더와 프로세스로 분리되어 구동됩니다.

---

## 1. 프로젝트 구조

```
D-03/
├── backend/                       # 백엔드 REST API 서버 (Node.js + Express + SQLite)
│   ├── .env                       # 환경변수 (포트 9803)
│   ├── package.json               # Express, SQLite3, CORS 등 의존성
│   ├── db.js                      # 17개 운동 종목, 38개 초기 운동 기록, reset 모듈
│   ├── server.js                  # Express API 라우트 및 의도적 오류 로직
│   └── fittrack.db                # 실제 SQLite 데이터베이스 파일
├── frontend/                      # 프론트엔드 웹 애플리케이션 (React + Vite)
│   ├── package.json               # React 18, Vite 5, Lucide-react
│   ├── vite.config.js             # 포트 9703 설정 및 /api 백엔드 프록시
│   ├── index.html                 # Pretendard & Chakra Petch 폰트
│   └── src/
│       ├── api.js                 # 백엔드 API 클라이언트 서비스
│       ├── App.jsx                # 메인 대시보드 및 전역 상태 관리
│       ├── index.css              # 다크그레이 & 라임그린 네온 스포츠 테마 스타일
│       ├── main.jsx               # React 진입점
│       └── components/
│           ├── Navbar.jsx         # 로고, 날짜 선택기, 리셋 & 추가 버튼
│           ├── KpiCards.jsx       # 총 시간, 총 세트, 칼로리, 세션 통계
│           ├── WeeklyChart.jsx    # 주간 요일별 트레이닝 볼륨 바 차트
│           ├── GoalProgress.jsx   # 주간 목표 달성률 및 달성 토글
│           ├── WorkoutCardList.jsx # 운동 세션 카드 그리드 및 완료 체크
│           ├── AddWorkoutModal.jsx # 종목 선택 및 세트/무게/시간 추가 모달
│           └── EditWorkoutModal.jsx # 운동 세션 세부 수정 모달
├── BUGS.md                        # 의도적 기능 오류 5종 상세 명세서
└── README.md                      # 프로젝트 실행 및 API 명세 문서
```

---

## 2. 포트 및 접속 URL

| 서비스 | 할당 포트 | URL | 비고 |
|--------|-----------|-----|------|
| **Frontend** | **9703** | `http://localhost:9703` | React + Vite 스포츠 대시보드 |
| **Backend** | **9803** | `http://localhost:9803` | Express REST API 서버 |

- 프론트엔드는 `/api/*` 경로의 모든 요청을 `http://localhost:9803/api/*`로 프록시 전달합니다.

---

## 3. 설치 및 실행 가이드

### 사전 요구사항
- Node.js (v18.0.0 이상)
- npm

### 1) 백엔드 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-03\backend"
npm install
npm start
# 또는 npm run dev
```
- 서버가 실행되면 `http://localhost:9803`에서 REST API가 활성화됩니다.
- 초기 구동 시 `fittrack.db`에 17개 운동 종목, 38개 실제 운동 기록, 4개 주간 목표 데이터가 자동 적재됩니다.

### 2) 프론트엔드 개발 서버 실행
```bash
cd "%USERPROFILE%\Desktop\errorsite\D-03\frontend"
npm install
npm run dev
```
- 브라우저에서 `http://localhost:9703`으로 접속하여 피트니스 대시보드를 사용할 수 있습니다.

---

## 4. REST API 엔드포인트 목록

### 시스템 & 테스트 지원
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/health` | 서버 헬스 체크 및 상태 확인 |
| `POST` | `/api/test/reset` | **DB 상태를 초기 38개 운동 기록 및 목표 상태로 완전 복원 (멱등성)** |
| `GET` | `/api/stats/weekly` | 총 시간, 세트, 칼로리 및 요일별 트레이닝 통계 |

### 운동 종목 & 주간 목표
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/exercises` | 17개 운동 종목 카탈로그 목록 조회 |
| `GET` | `/api/goals` | 주간 운동 목표 및 달성치 목록 조회 |
| `PATCH` | `/api/goals/:id/check` | 목표 달성 체크 토글 (`id: 1` 달성률 왜곡 버그 발생) |

### 운동 기록 (Workouts)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/workouts` | 운동 기록 목록 조회 (필터: date, type, search 등) |
| `POST` | `/api/workouts` | 새 운동 세션 기록 등록 |
| `PATCH` | `/api/workouts/:id/complete` | 운동 완료 상태 토글 (`id: 3` DB 미반영 버그 발생) |
| `PATCH` | `/api/workouts/:id` | 운동 기록 세부 수정 (`id: 11` 세트수 왜곡, `id: 14` 타날짜 변경 버그 발생) |
| `DELETE` | `/api/workouts/:id` | 운동 기록 삭제 (`id: 7` 삭제 누락 버그 발생) |

---

## 5. 의도적으로 삽입된 5개 기능 오류 요약 (ACTION_REPLAY)

자세한 재현 시나리오와 Evidence는 `BUGS.md`를 참조하세요.

1. **BUG-D03-01**: `트라이셉스 푸시다운` (기록 ID 3) 완료 클릭 시 완료 표시가 나타나지만 실제 DB는 미완료(0)로 남는 오류
2. **BUG-D03-02**: `스쿼트` (기록 ID 7) 삭제 시 목록에서 사라졌다가 다시 조회하면 그대로 다시 나타나는 오류
3. **BUG-D03-03**: `데드리프트` (기록 ID 11) 세트 수를 5세트로 수정하여 저장하면 3세트로 저장되는 오류
4. **BUG-D03-04**: `2026-10-04`의 `오버헤드 숄더프레스` (기록 ID 14)를 수정하면 `2026-10-02`의 `오버헤드 숄더프레스` (기록 ID 8)가 변경되는 오류
5. **BUG-D03-05**: `주 5회 근력운동 달성` (목표 ID 1) 달성 체크 클릭 시 목표 달성률이 100%가 아닌 20%로 왜곡 계산되는 오류
