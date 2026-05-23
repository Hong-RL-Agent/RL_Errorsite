🔍 Site #9016 포함 오류 정리
스케줄링 유기 (Abandoned Scheduling):

사용자가 대시보드에서 백업 작업을 삭제하면 UI(schedules 배열)에서는 사라지지만, 백엔드에서 돌아가던 setInterval 타이머는 중단되지 않습니다.

보이지 않는 자원 고갈 (Stealthy Resource Leak):

겉보기에는 스케줄이 하나도 없는데(Active Tasks: 0), 우측 상단의 Internal Tasks 카운트와 System Load는 계속 증가해 있습니다.

에이전트 훈련 포인트:

에이전트는 "관리 리스트에는 없는데 왜 실제 프로세스 상에서는 타이머가 계속 돌고 있을까?"를 발견하고 원인 코드(delete-schedule 엔드포인트)를 수정해야 합니다.