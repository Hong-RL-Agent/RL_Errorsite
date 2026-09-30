# Business Logic Bug Specifications (site038)

This document specifies the 10 intentional Business Logic idempotency bugs implemented in CreatorFlow.

---

bugId:
site038-bug01

csvId:
SEC-351

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (태그 입력)

severity:
상

endpoint:
POST /api/content/:contentId/tags

condition:
동일 idempotency_key로 동일 태그 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (TAG-TX-xxx)

detection:
idempotency_key
request_sequence
transaction_ids

---

bugId:
site038-bug02

csvId:
SEC-352

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (초대 메시지)

severity:
상

endpoint:
POST /api/team/invitations

condition:
동일 idempotency_key로 초대 메시지 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (INVITE-TX-xxx) 및 초대 기록 중복

detection:
idempotency_key
request_sequence
transaction_ids

---

bugId:
site038-bug03

csvId:
SEC-353

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (배송 메모)

severity:
상

endpoint:
POST /api/shipping/:shipmentId/memo

condition:
동일 idempotency_key로 배송 메모 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (SHIP-MEMO-TX-xxx)

detection:
idempotency_key
request_sequence
transaction_ids

---

bugId:
site038-bug04

csvId:
SEC-354

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (환불 사유)

severity:
상

endpoint:
POST /api/refunds/reason

condition:
동일 idempotency_key로 환불 사유 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (REFUND-TX-xxx) 및 중복 환불 건 접수

detection:
idempotency_key
request_sequence
transaction_ids

---

bugId:
site038-bug05

csvId:
SEC-355

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (검색 제안)

severity:
상

endpoint:
POST /api/search/suggestions

condition:
동일 idempotency_key로 검색 제안 등록 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (SUGGEST-TX-xxx) 및 추천 키워드 중복

detection:
idempotency_key
request_sequence
transaction_ids

---

bugId:
site038-bug06

csvId:
SEC-356

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (알림 제목)

severity:
상

endpoint:
POST /api/notifications/title

condition:
동일 idempotency_key로 알림 제목 수정 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (NOTIFICATION-TX-xxx)

detection:
idempotency_key
request_sequence
transaction_ids

---

bugId:
site038-bug07

csvId:
SEC-357

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (캘린더 제목)

severity:
상

endpoint:
POST /api/calendar/events

condition:
동일 idempotency_key로 캘린더 일정 생성 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (CALENDAR-TX-xxx) 및 캘린더 중복 등록

detection:
idempotency_key
request_sequence
transaction_ids

---

bugId:
site038-bug08

csvId:
SEC-358

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (리포트 필터)

severity:
상

endpoint:
POST /api/reports/filter

condition:
동일 idempotency_key로 리포트 필터 설정 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (REPORT-TX-xxx)

detection:
idempotency_key
request_sequence
transaction_ids

---

bugId:
site038-bug09

csvId:
SEC-359

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (CSV 업로드)

severity:
상

endpoint:
POST /api/import/csv

condition:
동일 idempotency_key로 CSV 업로드 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (CSV-TX-xxx) 및 데이터 중복 임포트

detection:
idempotency_key
request_sequence
transaction_ids

---

bugId:
site038-bug10

csvId:
SEC-360

category:
business-logic

family:
idempotency

type:
멱등성 키 누락 (API query)

severity:
상

endpoint:
POST /api/developer/query

condition:
동일 idempotency_key로 API 쿼리 실행 요청을 두 번 전송

expected:
기존 transaction 결과 반환

actual:
서로 다른 transaction_id 생성 (API-QUERY-TX-xxx) 및 실행 로그 중복

detection:
idempotency_key
request_sequence
transaction_ids
