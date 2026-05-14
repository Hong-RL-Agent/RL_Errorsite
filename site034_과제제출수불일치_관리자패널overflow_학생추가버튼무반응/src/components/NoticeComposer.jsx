import React from "react";

export default function NoticeComposer({ title, body, onTitleChange, onBodyChange, onPreparing }) {
  return (
    <section className="notice-panel">
      <div className="section-heading"><span>Notice</span><h2>공지 작성</h2></div>
      <input value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="공지 제목" />
      <textarea value={body} onChange={(event) => onBodyChange(event.target.value)} placeholder="공지 내용을 입력하세요" />
      <button onClick={onPreparing}>공지 예약 발송</button>
    </section>
  );
}
