# CareBridge (site059) 상세 오류 명세서 (bug.md)

본 문서는 CareBridge 병원 예약·진료 관리 플랫폼에 구현된 정확히 5개의 의도적 오류(SEC-471 ~ SEC-475)의 발생 원인, 정상 동작, 재현 방법 및 PPO 탐색 기대 trajectory를 설명합니다.

---

## 1. site059-SEC-471

1. **Bug ID**: `site059-SEC-471`
2. **오류 유형**: `Data Filtering (falsy-value-filter)`
3. **발생 조건**: 의사 검색 화면에서 사용자가 경력 연차 필터로 '0년 이상(전체)'을 선택하고 필터링을 요청할 때 발생
4. **정상 동작**: `minExperience=0` 선택 시 경력이 0년 이상인 모든 의사(신입/인턴 포함)가 정상적으로 조회되어야 함
5. **실제 동작**: `minExperience=0` 파라미터가 전달되었으나 서버 조건문에서 `0`을 falsy로 평가하여 필터가 실행되지 않음
6. **재현 방법**:
   - 상단 네비게이션 '병원 찾기' 클릭
   - 상단 탭 '의사 찾기' 전환
   - 경력 필터 드롭다운에서 '경력 0년 이상 (전체)' 선택 후 [필터 적용] 클릭
7. **관련 API**: `GET /api/doctors?minExperience=0`
8. **관련 파일**: `server.js`
9. **오류 원인**: `if (minExperience && Number(minExperience) > 0)` 형태로 검사하여 숫자 `0`에 대한 필터 처리가 누락됨
10. **PPO가 관찰할 수 있는 현상**: '0년 이상' 필터를 선택했음에도 불구하고 필터 적용 전과 동일한 결과가 유지되거나 조건이 무시됨
11. **기대 trajectory**:
    ```text
    홈 (/home)
    → 병원 및 의료진 검색 (/hospitals)
    → 의사 찾기 탭 클릭
    → 경력 필터 '0년 이상' 선택
    → 필터 미적용 현상 확인
    ```

---

## 2. site059-SEC-472

1. **Bug ID**: `site059-SEC-472`
2. **오류 유형**: `Client Storage (storage-json-parse-failure)`
3. **발생 조건**: 브라우저 `localStorage`의 `carebridge_preferences` 키에 불완전하거나 손상된 JSON 문자열이 저장된 상태에서 마이페이지 진입 시 발생
4. **정상 동작**: 저장된 JSON 데이터가 손상된 경우 기본 설정값으로 안전하게 fallback 되어 화면이 정상 렌더링되어야 함
5. **실제 동작**: `JSON.parse(localStorage.getItem('carebridge_preferences'))` 실행 중 Uncaught SyntaxError가 발생하여 컴포넌트 마운트 및 설정 렌더링이 중단됨
6. **재현 방법**:
   - 브라우저 개발자도구 콘솔에서 `localStorage.setItem('carebridge_preferences', '{"theme":')` 실행
   - 상단 네비게이션 '마이페이지' 클릭
   - 화면 렌더링 오류 발생
7. **관련 API**: `N/A` (Client Storage)
8. **관련 파일**: `src/pages/Account.jsx`
9. **오류 원인**: `try...catch` 예외 처리 블록 없이 `JSON.parse()`를 직접 호출하여 파싱 실패 시 상위 렌더링이 중단됨
10. **PPO가 관찰할 수 있는 현상**: 마이페이지 탭 클릭 시 화면이 렌더링되지 않거나 빈 화면 또는 크래시 발생
11. **기대 trajectory**:
    ```text
    마이페이지 (/account)
    → 사용자 설정 로컬 저장
    → 손상된 localStorage 데이터 존재 시 페이지 새로고침
    → 화면 렌더링 실패 확인
    ```

---

## 3. site059-SEC-473

1. **Bug ID**: `site059-SEC-473`
2. **오류 유형**: `DOM Event (nested-click-propagation)`
3. **발생 조건**: 병원 목록 또는 홈 화면에서 병원 카드 내부의 '즐겨찾기(하트)' 버튼을 클릭할 때 발생
4. **정상 동작**: 하트 버튼 클릭 시 해당 병원의 즐겨찾기 상태만 토글되고 현재 페이지 목록 상태가 유지되어야 함
5. **실제 동작**: 하트 버튼 클릭 이벤트가 부모 카드로 버블링되어 `onToggleFavorite` 실행과 동시에 `onSelectHospital`이 연쇄 실행되어 병원 상세 페이지로 이동함
6. **재현 방법**:
   - 상단 네비게이션 '병원 찾기' 클릭
   - 검색된 병원 카드 우상단의 하트(즐겨찾기) 아이콘 클릭
   - 즐겨찾기 토글과 동시에 병원 상세 페이지(`/hospitals/:id`)로 이동하는 현상 확인
7. **관련 API**: `N/A` (Frontend DOM Event)
8. **관련 파일**: `src/components/HospitalCard.jsx`
9. **오류 원인**: 하위 하트 버튼의 `onClick` 핸들러에서 이벤트 버블링을 방지하는 `e.stopPropagation()` 호출이 누락됨
10. **PPO가 관찰할 수 있는 현상**: 단순 하트 버튼 클릭 한 번으로 상세 페이지 이동 네비게이션이 동시에 발생하는 이상 현상 관찰
11. **기대 trajectory**:
    ```text
    병원 찾기 (/hospitals)
    → 특정 병원 카드 확인
    → 카드 우상단 하트 버튼 클릭
    → 즐겨찾기 반영과 함께 병원 상세 페이지로 즉시 전환되는 현상 확인
    ```

---

## 4. site059-SEC-474

1. **Bug ID**: `site059-SEC-474`
2. **오류 유형**: `URL State (array-query-serialization)`
3. **발생 조건**: 병원 검색 화면에서 2개 이상의 진료과목(예: 내과 + 정형외과)을 다중 선택하여 필터링할 때 발생
4. **정상 동작**: 선택된 진료과목 중 하나 이상을 보유한 병원이 정상적으로 필터링되어 목록에 노출되어야 함
5. **실제 동작**: 클라이언트가 `departments=internal,orthopedic`로 전송하고, 서버는 `h.departments.includes("internal,orthopedic")` 단일 문자열 일치 검사를 수행하여 매칭 결과가 0개로 표시됨
6. **재현 방법**:
   - 상단 네비게이션 '병원 찾기' 클릭
   - 진료과목 필터에서 '내과' 클릭
   - 이어 '정형외과' 추가 클릭 (다중 선택 상태)
   - 결과 목록이 0개로 비워지는 현상 확인
7. **관련 API**: `GET /api/hospitals?departments=internal,orthopedic`
8. **관련 파일**: `src/api/client.js`, `server.js`
9. **오류 원인**: 콤마 분리 문자열(comma-separated string)을 서버에서 배열로 파싱(split)하지 않고 단일 값으로 직접 매칭하여 불일치 발생
10. **PPO가 관찰할 수 있는 현상**: 내과와 정형외과를 모두 보유한 대형 병원이 존재함에도 다중 선택 시 '조건에 일치하는 병원이 없습니다' 화면 노출
11. **기대 trajectory**:
    ```text
    병원 찾기 (/hospitals)
    → 진료과 다중 선택 필터 클릭 (내과 선택)
    → 정형외과 추가 선택
    → 총 0개의 병원 검색 결과 화면 관찰
    ```

---

## 5. site059-SEC-475

1. **Bug ID**: `site059-SEC-475`
2. **오류 유형**: `Media Rendering (image-load-race)`
3. **발생 조건**: 병원 상세 페이지(`HospitalDetail.jsx`)에서 의사 탭을 빠르게 연속으로 전환할 때 발생 (예: 의사 A 선택 직후 의사 B 선택)
4. **정상 동작**: 현재 선택된 의사 B의 프로필 이미지가 완전히 로딩될 때까지 로딩 상태/스켈레톤이 유지되어야 함
5. **실제 동작**: 이전 의사 A 이미지의 늦은 비동기 `onLoad` 이벤트가 `setImageLoading(false)`를 호출하여, 새 의사 B 이미지가 아직 로딩 중임에도 로딩 UI가 사라지고 빈 영역이 노출됨
6. **재현 방법**:
   - 병원 상세 페이지 진입 (`/hospitals/hosp-101`)
   - 의사 탭 목록에서 첫 번째 의사 클릭 직후 빠르게 두 번째 의사 클릭
   - 프로필 사진 영역의 스켈레톤이 조기 해제되며 빈 회색 영역이 노출되는 현상 확인
7. **관련 API**: `N/A` (Media Rendering Race Condition)
8. **관련 파일**: `src/pages/HospitalDetail.jsx`
9. **오류 원인**: `onLoad` 이벤트 핸들러에서 현재 활성화된 의사 식별자와 일치하는지 검증하지 않고 단일 boolean state를 조작하여 발생하는 비동기 경쟁 상태
10. **PPO가 관찰할 수 있는 현상**: 이미지가 완전히 렌더링되지 않았음에도 로딩 상태가 해제되어 UI와 실제 이미지 상태의 불일치 관찰
11. **기대 trajectory**:
    ```text
    병원 상세 페이지 (/hospitals/:id)
    → 소속 의료진 탭 확인
    → 의사 A 클릭 직후 빠르게 의사 B 클릭
    → 의사 B 프로필 사진 로딩 스켈레톤 조기 종료 및 빈 영역 노출 관찰
    ```
