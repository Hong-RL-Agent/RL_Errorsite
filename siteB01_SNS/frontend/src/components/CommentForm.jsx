import React, { useState } from 'react';

export default function CommentForm({ onSubmit }) {
  const [text, setText] = useState('');

  const submitComment = async () => {
    const content = text.trim();
    if (!content) return;
    await onSubmit(content);
    setText('');
  };

  // INTENTIONAL_ERROR: B01-ERR04
  // CSV Error: 의도치 않은 더블 클릭 (이벤트 중복)
  // Strategy: ACTION_REPLAY
  // Description: 버튼 클릭 핸들러와 폼 제출 핸들러가 모두 등록 함수를 호출해 POST 요청이 두 번 전송됨.
  return (
    <form
      className="comment-form"
      onSubmit={(e) => {
        e.preventDefault();
        submitComment();
      }}
    >
      <input
        type="text"
        placeholder="댓글을 입력하세요…"
        value={text}
        maxLength={300}
        onChange={(e) => setText(e.target.value)}
        aria-label="댓글 입력"
      />
      <button type="submit" className="btn btn-primary" data-bug-id="B01-ERR04" onClick={submitComment}>
        댓글 등록
      </button>
    </form>
  );
}
