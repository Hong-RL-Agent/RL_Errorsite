export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export const ACTIVITY_LABELS = {
  post_create: '게시물 작성',
  post_update: '게시물 수정',
  post_delete: '게시물 삭제',
  like: '좋아요',
  unlike: '좋아요 취소',
  comment_create: '댓글 작성',
  comment_delete: '댓글 삭제',
  follow: '팔로우',
  unfollow: '언팔로우',
  save: '저장',
  unsave: '저장 취소',
};

export const NOTIFICATION_LABELS = { like: '좋아요', comment: '댓글', follow: '팔로우', save: '저장' };
