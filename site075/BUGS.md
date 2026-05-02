# BUGS (site075)

## 1. site075-bug01
- **Type:** `database-conflict`
- **Description:** 같은 멘토와 같은 시간대에 여러 신청 허용.
- **Data-Bug-ID:** `site075-bug01`

## 2. site075-bug02
- **Type:** `network-error-body`
- **Description:** 신청 실패 응답 body에 success:true가 포함됨.
- **Data-Bug-ID:** `site075-bug02`

## 3. site075-bug03
- **Type:** `security-data-exposure`
- **Description:** 일반 사용자가 mentorApplications API로 전체 신청자 목록 조회 가능.
- **Data-Bug-ID:** `site075-bug03`
