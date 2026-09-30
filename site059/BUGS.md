# CareBridge (site059) 의도적 오류 목록 (BUGS.md)

이 문서는 CareBridge 병원 예약·진료 관리 플랫폼에 구현된 정확히 5개의 의도적 오류(SEC) 목록을 정의합니다.

---

### site059-SEC-471

- **bugId**: `site059-SEC-471`
- **type**: `Data Filtering`
- **Korean type**: `배열의 filter 조건에서 0을 유효한 값으로 처리하지 못하는 오류`
- **endpoint**: `/api/doctors`
- **method**: `GET`
- **condition**: 의사 검색 화면에서 사용자가 경력 연차 필터로 '0년 이상(전체 신입 포함)'을 선택하고 필터링을 요청할 때 발생
- **files**: `server.js`
- **location**: `server.js:296`
- **selector**: `select:has-text("경력 0년 이상")`
- **symptom**: 사용자가 명시적으로 `minExperience=0`을 선택하여 필터를 적용했음에도 불구하고, 서버의 falsy 조건문 처리로 인해 필터가 적용되지 않고 전체 목록이 그대로 반환되거나 조건이 무시됨
- **status**: `Open`
- **example**: `GET /api/doctors?minExperience=0` 요청 시 `Number("0") > 0` 또는 `if (minExperience)` 조건에서 `0`이 falsy로 평가되어 경력 0년 필터 분기문이 실행되지 않음
- **cause**: JavaScript의 조건문에서 숫자 `0`이 falsy로 평가되는 특성을 고려하지 않고 `if (minExperience && Number(minExperience) > 0)` 형태로 필터 조건을 검사함
- **PPO expected behavior**: 병원/의사 검색 → 의사 찾기 탭 → 경력 필터 '0년 이상' 선택 → 필터 적용 시 결과가 변경되지 않고 조건이 무시되는 현상 관찰

---

### site059-SEC-472

- **bugId**: `site059-SEC-472`
- **type**: `Client Storage`
- **Korean type**: `localStorage에 저장된 JSON 파싱 실패로 전체 설정 초기화가 중단되는 오류`
- **endpoint**: `N/A` (Client LocalStorage)
- **method**: `Storage Read`
- **condition**: 브라우저 `localStorage`의 `carebridge_preferences` 키에 불완전하거나 손상된 JSON 문자열이 저장되어 있을 때 마이페이지(`Account.jsx`)에 진입할 때 발생
- **files**: `src/pages/Account.jsx`
- **location**: `src/pages/Account.jsx:36`
- **selector**: `button:has-text("마이페이지")`
- **symptom**: `localStorage.getItem('carebridge_preferences')`로 읽어온 손상된 문자열을 `JSON.parse()`할 때 `SyntaxError` 예외가 발생하고, 컴포넌트 마운트 및 설정 렌더링이 중단됨
- **status**: `Open`
- **example**: `localStorage.setItem('carebridge_preferences', '{"theme":')` 상태에서 마이페이지 진입 시 Uncaught SyntaxError 발생으로 화면 렌더링 중단
- **cause**: 로컬 스토리지에 저장된 사용자 설정값을 역직렬화할 때 `try...catch` 방어 코드 없이 직접 `JSON.parse()`를 실행함
- **PPO expected behavior**: 마이페이지 진입 또는 새로고침 시 localStorage 데이터 손상으로 인해 설정 영역 렌더링 실패 관찰

---

### site059-SEC-473

- **bugId**: `site059-SEC-473`
- **type**: `DOM Event`
- **Korean type**: `중첩 클릭 이벤트가 두 번 실행되는 오류`
- **endpoint**: `N/A` (Frontend DOM Event)
- **method**: `UI Click`
- **condition**: 병원 목록(`Hospitals.jsx`) 또는 홈 화면에서 병원 카드 내부의 '즐겨찾기(하트)' 버튼을 클릭할 때 발생
- **files**: `src/components/HospitalCard.jsx`
- **location**: `src/components/HospitalCard.jsx:18`
- **selector**: `.hospital-card button[title*="즐겨찾기"]`
- **symptom**: 사용자가 병원 카드 우상단의 하트 버튼만 클릭하여 즐겨찾기 상태를 토글하려 했으나, 부모 카드의 `onClick`(병원 상세 페이지 이동) 핸들러까지 연쇄 실행되어 의도치 않게 병원 상세 화면으로 즉시 이동함
- **status**: `Open`
- **example**: 병원 카드 내 하트 버튼 클릭 시 `onToggleFavorite`과 `onSelectHospital`이 연속으로 호출되어 화면이 `/hospitals/:id`로 전환됨
- **cause**: 하위 버튼의 `onClick` 핸들러에서 DOM 이벤트 전파를 중단하는 `event.stopPropagation()` 호출이 누락됨
- **PPO expected behavior**: 병원 목록 → 특정 병원 카드의 하트 버튼 클릭 → 즐겨찾기 토글과 동시에 병원 상세 페이지로 강제 이동하는 현상 관찰

---

### site059-SEC-474

- **bugId**: `site059-SEC-474`
- **type**: `URL State`
- **Korean type**: `URL query parameter의 배열 직렬화 형식 불일치`
- **endpoint**: `/api/hospitals`
- **method**: `GET`
- **condition**: 병원 검색 화면에서 여러 개의 진료과목(예: 내과, 정형외과, 피부과)을 다중 선택하여 필터링을 요청할 때 발생
- **files**: `src/api/client.js`, `server.js`
- **location**: `server.js:247`
- **selector**: `button:has-text("내과"), button:has-text("정형외과")`
- **symptom**: 사용자가 2개 이상의 진료과목을 선택했으나 클라이언트는 쉼표 구분 문자열(`departments=internal,orthopedic`)로 직렬화하여 전송하고, 서버는 이를 단일 진료과 코드로 매칭 검사하여 일치하는 병원이 0개로 반환됨
- **status**: `Open`
- **example**: `GET /api/hospitals?departments=internal,orthopedic` 호출 시 서버는 `h.departments.includes("internal,orthopedic")`를 검사하므로 매칭되는 병원이 없음
- **cause**: 클라이언트의 다중 값 URL query 직렬화 방식(콤마 분리 문자열)과 서버의 파라미터 파싱 방식(배열 또는 단일 일치 기대) 불일치
- **PPO expected behavior**: 병원 검색 → 진료과 다중 선택 (내과 + 정형외과) → 검색 결과가 0개로 표시되는 현상 관찰

---

### site059-SEC-475

- **bugId**: `site059-SEC-475`
- **type**: `Media Rendering`
- **Korean type**: `이미지 onLoad 이벤트가 이전 이미지의 상태를 덮어쓰는 오류`
- **endpoint**: `N/A` (Media Rendering Race Condition)
- **method**: `UI Tab Switch`
- **condition**: 병원 상세 페이지(`HospitalDetail.jsx`)에서 의사 탭을 빠르게 연속으로 전환할 때 발생 (예: 의사 A 클릭 직후 의사 B 클릭)
- **files**: `src/pages/HospitalDetail.jsx`
- **location**: `src/pages/HospitalDetail.jsx:49`
- **selector**: `button:has-text("김서연"), button:has-text("이준호")`
- **symptom**: 이전 의사 이미지의 지연된 비동기 `onLoad` 이벤트가 현재 선택된 새 의사 이미지의 로딩 상태를 조기 해제하여, 새 이미지가 완전히 로드되기 전에 스켈레톤/로딩 UI가 사라지고 빈 영역이 노출됨
- **status**: `Open`
- **example**: 의사 A 선택 직후 의사 B 선택 시, A 이미지의 느린 `onLoad`가 `setImageLoading(false)`를 호출하여 B 이미지 로딩 중 스켈레톤이 조기 종료됨
- **cause**: `onLoad` 콜백에서 현재 활성화된 의사 식별자(`selectedDoctorId`)와 로드된 이미지의 일치 여부를 검증하지 않고 단일 boolean state를 조작하여 발생하는 비동기 Race Condition
- **PPO expected behavior**: 병원 상세 → 의사 A 클릭 직후 의사 B 클릭 → 의사 B 이미지 로딩 중 스켈레톤 조기 종료 및 빈 영역 노출 관찰
