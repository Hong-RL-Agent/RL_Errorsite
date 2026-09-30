# Intentional Bug & Vulnerability Specifications (site048 - ClassMate)

This document specifies the 5 intentional vulnerability and business logic flaw cases implemented in site048 for PPO agent exploration and dataset generation.

---

### SEC-416
- **bugId**: SEC-416
- **type**: resource-authorization
- **Korean type**: 권한 없는 클래스 공지 수정
- **category**: authorization
- **family**: resource-authorization
- **endpoint**: /api/classes/:classId/announcements/:announcementId
- **method**: PATCH
- **condition**: Request user modifies a class announcement without backend verifying that the user is the instructor assigned to the target class.
- **files**: server.js, src/pages/ClassDetail.jsx, src/components/AnnouncementList.jsx
- **location**: PATCH /api/classes/:classId/announcements/:announcementId handler
- **selector**: #btn-edit-announcement, #btn-save-announcement
- **symptom**: A general user (role: 'user') can send a PATCH request to edit class notices and receive a 200 OK success response.
- **status**: intentional
- **example**: User '김민지' sends PATCH /api/classes/101/announcements/1 to change notice content, and the server persists changes despite instructorId being 3 ('박서준').
- **cause**: Server checks announcement existence but does not enforce class.instructorId === requestUser.id authorization check.
- **PPO expected behavior**: Explore class announcement editing across user roles and observe missing authorization barriers.

---

### SEC-417
- **bugId**: SEC-417
- **type**: filter-state-sync
- **Korean type**: 검색 결과 페이지의 필터 상태 불일치
- **category**: state
- **family**: filter-state-sync
- **endpoint**: /api/classes
- **method**: GET
- **condition**: Sequential rapid category/region filter switching causes the server to retain previous query elements in returned array.
- **files**: server.js, src/pages/Search.jsx, src/components/SearchFilter.jsx
- **location**: GET /api/classes handler filter condition
- **selector**: #filter-category-select, #category-tab-btn, #class-result-card
- **symptom**: When user filters by '사진', the result list still contains an item from the previous '도예' filter query.
- **status**: intentional
- **cause**: Server filter logic retains items from previous state during category transitions.
- **PPO expected behavior**: Rapidly switch category tabs and inspect differences between UI filter active state and rendered card data.

---

### SEC-418
- **bugId**: SEC-418
- **type**: upload-preview-sync
- **Korean type**: 프로필 이미지 파일 업로드 후 미리보기 불일치
- **category**: file
- **family**: upload-preview-sync
- **endpoint**: /api/profile/avatar
- **method**: POST
- **condition**: User uploads a new profile image; server persists new avatar in backend state, but returns previous cached avatar URL in response object.
- **files**: server.js, src/pages/Profile.jsx
- **location**: POST /api/profile/avatar handler
- **selector**: #input-avatar-file, #btn-upload-avatar, #profile-avatar-img
- **symptom**: Upload succeeds with 200 OK, but client avatar preview remains the old image until explicit navigation/refresh.
- **status**: intentional
- **cause**: Server response body returns stale user.avatar property instead of newly saved avatarUrl.
- **PPO expected behavior**: Upload a new avatar and observe desync between uploaded file state and frontend view state.

---

### SEC-419
- **bugId**: SEC-419
- **type**: state-transition
- **Korean type**: 클래스 신청 취소 후 상태 전이 오류
- **category**: business-logic
- **family**: state-transition
- **endpoint**: /api/enrollments/:id/cancel
- **method**: PATCH
- **condition**: The server sets enrollment.status to 'cancelled' without verifying valid state machine rules (e.g. allowing completed or already cancelled enrollments to be cancelled).
- **files**: server.js, src/pages/MyClasses.jsx
- **location**: PATCH /api/enrollments/:id/cancel handler
- **selector**: #btn-cancel-enrollment
- **symptom**: An enrollment with status 'completed' or 'cancelled' can be transitioned to 'cancelled' again with 200 OK.
- **status**: intentional
- **cause**: Server blindly sets status = 'cancelled' without pre-condition assertions.
- **PPO expected behavior**: Attempt cancelling completed or cancelled classes and observe unrestricted state transition.

---

### SEC-420
- **bugId**: SEC-420
- **type**: orphaned-child-data
- **Korean type**: 게시글 삭제 후 댓글 데이터 잔존
- **category**: data-integrity
- **family**: orphaned-child-data
- **endpoint**: /api/posts/:id
- **method**: DELETE
- **condition**: Deleting a community post removes the post entity but leaves child comment objects in the in-memory comments store without cascade cleanup.
- **files**: server.js, src/pages/Community.jsx, src/pages/PostDetail.jsx
- **location**: DELETE /api/posts/:id handler
- **selector**: #btn-delete-post
- **symptom**: Post is removed from list, but child comments still exist in comments store and can be queried via comment endpoints.
- **status**: intentional
- **cause**: Lack of cascading delete logic in post deletion handler.
- **PPO expected behavior**: Create a post with comments, delete the post, and observe residual orphaned comment records.
