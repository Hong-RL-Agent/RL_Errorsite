# MediCare Portal - 병원 예약 시스템

## 사이트 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | MediCare Portal |
| **사이트 ID** | site007 |
| **포트** | 9226 |
| **기술 스택** | React 18 + Vite 5 + Express 4 + Lucide React |
| **주제** | 온라인 병원 진료 예약 시스템 (민트/화이트 테마) |

## 실행 방법

```bash
cd site007
npm install
npm run build   # React 앱 빌드
npm start       # Express 서버 실행 (포트 9226)
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/departments` | 진료과 목록 조회 |
| GET | `/api/doctors?dept=전체` | 의사 목록 조회 (진료과 필터) |
| GET | `/api/slots` | 예약 가능 시간 슬롯 조회 |

## 정상 작동 기능

- ✅ 상단 진료과(내과, 정형외과 등) 탭을 통한 의사 목록 필터링
- ✅ 의사 카드 선택 시 우측 예약 패널 활성화
- ✅ 예약 패널에서 예약 시간 선택 활성화 (선택 시 민트색 배경 처리)
- ✅ 입력 폼 내 포커스 및 텍스트 입력 정상 동작

## 의도된 GUI 오류 3개

### site007-bug01 — button-no-response
- **위치**: 우측 예약 패널 하단의 "예약 확정" 버튼
- **증상**: 시간 선택 후 버튼이 활성화되어 클릭할 수 있으나, 클릭 시 아무 일도 일어나지 않음.
- **selector**: `[data-bug-id="site007-bug01"]`

### site007-bug02 — component-rendering
- **위치**: 좌측 본문의 의사 목록 리스트
- **증상**: "박의사(피부과)" 카드가 똑같은 내용으로 나란히 두 번 중복되어 나타남.
- **selector**: `[data-bug-id="site007-bug02"]`

### site007-bug03 — css-layout
- **위치**: 우측 예약 패널의 환자 정보 폼 내 "환자 성함" 입력란
- **증상**: 라벨과 입력 인풋창의 공간이 부족하여(고정 높이 할당) 시각적으로 요소가 겹침.
- **selector**: `[data-bug-id="site007-bug03"]`
