# BUGS - site048 Cleaning Service Reservation

This document tracks intentional frontend GUI bugs implemented for PPO agent training.

| bugId | CSV 오류명 | Type | 화면 위치 | 관련 파일 | data-bug-id selector | 증상 | 의도된 원인 | 기대 행동 |
|-------|------------|------|-----------|-----------|----------------------|------|-------------|-----------|
| site048-bug01 | 선택 옵션 표시 오류 | selected-options-display-error | 우측 예약 요약 패널 | `app.js` | `[data-bug-id="site048-bug01"]` | 사용자가 "냉장고 청소"를 선택하면 요약에는 "창문 청소"가 표시됨 | `optionLabels` 객체에서 'refrigerator'와 'window'의 레이블이 의도적으로 뒤바뀜 | 선택한 체크박스의 실제 값과 일치하는 텍스트가 요약에 표시되어야 함 |
| site048-bug02 | 폼 컬럼 깨짐 | quote-form-column-break | 좌측 견적 폼 | `styles.css` | `[data-bug-id="site048-bug02"]` | 화면 폭 1024px~1200px에서 견적 폼의 '성함'과 '연락처' 입력란이 겹침 | 미디어 쿼리에서 고정 너비(300px)와 음수 gap(-50px)을 사용하여 레이아웃 붕괴 유도 | 화면 폭에 관계없이 입력란이 겹치지 않고 적절한 간격을 유지해야 함 |
| site048-bug03 | 견적 계산 버튼 무반응 | quote-calculate-button-no-response | 좌측 견적 폼 하단 | `app.js` | `[data-bug-id="site048-bug03"]` | "견적 계산하기" 버튼을 클릭해도 예상 금액이 0원 혹은 이전 상태에서 변하지 않음 | `document.getElementById` 호출 시 실제 버튼 ID가 아닌 잘못된 ID를 사용하여 이벤트 리스너가 미연결됨 | 버튼 클릭 시 서비스, 면적, 옵션을 합산한 최종 견적 금액이 화면에 업데이트되어야 함 |
