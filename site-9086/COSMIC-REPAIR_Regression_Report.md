# COSMIC-REPAIR Regression Report

이 프로젝트는 PPO 에이전트가 브라우저 렌더링 성능 저하와 정교한 UI 상호작용 결함을 학습할 수 있도록 의도적으로 취약 패턴을 포함합니다. 모든 외부 진입점은 `http://localhost:9086` 기준으로 격리되어 있습니다.

## 결함 주입 목록

1. **left/top 리플로우 폭풍**
   - 위치: `frontend/src/components/RepairQueue.tsx`
   - 부품 목록 애니메이션이 `transform` 대신 `left`와 `top`을 매 프레임 변경합니다.
   - 관찰 포인트: Layout/Recalculate Style 증가, FPS 하락.

2. **z-index 레이어 꼬임 및 중요 버튼 클릭 차단**
   - 위치: `frontend/src/components/ReportsLayer.tsx`, `frontend/src/styles.css`
   - 투명한 상위 레이어가 수리 요청 버튼 위를 덮어 클릭을 가로챕니다.
   - 관찰 포인트: 버튼 hover는 보이나 click handler가 실행되지 않는 구간.

3. **창 닫기 시 해제되지 않는 전역 이벤트 리스너**
   - 위치: `frontend/src/components/ReportsLayer.tsx`
   - 팝업을 열 때 `window`에 등록한 `mousemove`, `keydown` 리스너를 닫을 때 제거하지 않습니다.
   - 관찰 포인트: 팝업 반복 후 heap snapshot listener 증가.

4. **useEffect 의존성 오류로 인한 렌더링 루프**
   - 위치: `frontend/src/components/ResourceMonitor.tsx`
   - 상태 객체 자체를 의존성에 두고 같은 effect에서 다시 상태를 갱신합니다.
   - 관찰 포인트: Render count 급증, CPU 사용률 상승.

5. **비동기 업데이트 중 Zustand 정합성 파괴**
   - 위치: `frontend/src/store/repairStore.ts`
   - 낙관적 업데이트와 지연 응답이 같은 배열을 오래된 스냅샷으로 덮어씁니다.
   - 관찰 포인트: 진행률 역행, 완료 상태가 다시 pending으로 바뀜.

6. **디바운싱 부재로 인한 Double Submit**
   - 위치: `frontend/src/components/RepairConsole.tsx`
   - 수리 요청 버튼에 loading lock, debounce, idempotency key가 없습니다.
   - 관찰 포인트: 빠른 연타 시 `/api/repairs` POST 중복 발생.

7. **브라우저 자동완성 상태 미동기화**
   - 위치: `frontend/src/components/RepairConsole.tsx`
   - uncontrolled input과 React 상태를 혼용하여 자동완성 값이 submit state에 반영되지 않습니다.
   - 관찰 포인트: 화면 입력값과 payload `shipCode` 불일치.

8. **모바일 Safari 주소창 `vh` 레이아웃 버그**
   - 위치: `frontend/src/styles.css`
   - 루트 레이아웃이 `height: 100vh`에 고정되어 동적 주소창 높이를 반영하지 않습니다.
   - 관찰 포인트: 하단 관제 패널 잘림.

9. **iOS input focus 스크롤 고정 및 레이아웃 깨짐**
   - 위치: `frontend/src/components/RepairConsole.tsx`, `frontend/src/styles.css`
   - focus 시 body overflow를 고정하고 해제 타이밍을 누락합니다.
   - 관찰 포인트: 키보드 닫힌 뒤에도 스크롤 위치와 패널 배치가 어긋남.

10. **WebRTC ICE Candidate 수집 지연**
    - 위치: `frontend/src/components/RemoteAssist.tsx`
    - ICE 수집을 인위적으로 지연시키고 timeout fallback을 두지 않습니다.
    - 관찰 포인트: 원격 지원 상태가 `collecting`에 오래 머무름.

11. **WebGL 컨텍스트 유실 복구 부재**
    - 위치: `frontend/src/components/ShipWireframe.tsx`
    - `webglcontextlost`에서 preventDefault만 수행하고 renderer 재생성 로직을 제공하지 않습니다.
    - 관찰 포인트: 컨텍스트 유실 후 3D 모델이 빈 화면으로 남음.

## 네트워크 격리 검증

- 사용자 진입 URL: `http://localhost:9086`
- 프론트 API 호출: 상대 경로 `/api/...`
- Docker Compose 호스트 노출: `9086:80`
- 백엔드 CORS 허용 origin: `http://localhost:9086`
- 이전 프로젝트 포트 참조 없음
