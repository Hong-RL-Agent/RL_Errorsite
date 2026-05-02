# BUGS (site034)

## 1. site034-bug01
- **Type:** `database-validation`
- **Description:** 종료일이 시작일보다 빠른 예약도 저장됨.
- **Data-Bug-ID:** `site034-bug01`

## 2. site034-bug02
- **Type:** `network-request-validation`
- **Description:** 필수 petId가 없어도 서버가 성공 응답을 보냄.
- **Data-Bug-ID:** `site034-bug02`

## 3. site034-bug03
- **Type:** `security-idor`
- **Description:** petId 변경으로 다른 사용자의 반려동물 정보 조회 가능.
- **Data-Bug-ID:** `site034-bug03`
