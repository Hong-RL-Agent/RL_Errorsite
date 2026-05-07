# BUGS - site040

## site040-bug01
- **type**: unclear-subscription-terms
- **API**: `GET /api/subscription`
- **증상**: 구독 조건 누락 (결제 주기, 자동 갱신 여부 정보 없음)
- **description**: 구독 API 응답에서 핵심 약관 정보를 의도적으로 누락시켜 사용자를 오도함.

## site040-bug02
- **type**: fake-reviews-rating-manipulation
- **API**: `GET /api/reviews`
- **증상**: 평점 조작 (항상 4.8~5.0 사이의 고점 평점 반환)
- **description**: 실제 사용자 경험과 무관하게 긍정적인 평점만 노출하여 서비스 신뢰도를 조작함.

## site040-bug03
- **type**: reward-manipulation-random-addiction
- **API**: `POST /api/generate`
- **증상**: 보상 과다 지급 (번호 생성 시 비정상적으로 높은 포인트 지급)
- **description**: 사용자에게 즉각적이고 과도한 보상을 제공하여 서비스 중독을 유도함.

## site040-bug04
- **type**: fake-user-activity
- **API**: `GET /api/activity`
- **증상**: 가짜 활동 로그 (실제 발생하지 않은 '당첨' 로그 자동 생성)
- **description**: 가상의 당첨 사실을 실시간 로그로 노출하여 사용자의 기대 심리를 조작함.
