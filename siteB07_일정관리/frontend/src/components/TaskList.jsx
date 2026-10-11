import React, { useState } from 'react';

const PRIORITY = { low: '낮음', normal: '보통', high: '높음' };

function TaskRow({ task, onToggle, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const save = async () => {
    if (!title.trim()) return;
    await onSave(task.id, { title });
    setEditing(false);
  };

  return (
    <li className={`task-row${task.done ? ' done' : ''}`}>
      <label className="task-check">
        <input type="checkbox" checked={task.done} onChange={() => onToggle(task)} aria-label={`${task.title} 완료`} />
      </label>
      {editing ? (
        <span className="task-edit">
          <input type="text" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} aria-label="할 일 제목 수정" />
          <button type="button" className="btn small" onClick={save}>저장</button>
          <button type="button" className="btn small ghost" onClick={() => { setEditing(false); setTitle(task.title); }}>취소</button>
        </span>
      ) : (
        <>
          <span className="task-title">{task.title}</span>
          <span className={`pri ${task.priority}`}>{PRIORITY[task.priority]}</span>
          <span className="muted due">{task.dueDate || '기한 없음'}</span>
          <span className="task-actions">
            <button type="button" className="link-btn" onClick={() => setEditing(true)}>수정</button>
            <button type="button" className="link-btn danger" onClick={() => onDelete(task)}>삭제</button>
          </span>
        </>
      )}
    </li>
  );
}

export default function TaskList({ title, tasks, empty, onToggle, onSave, onDelete }) {
  return (
    <section className="card">
      <h2>{title} <span className="muted">{tasks.length}</span></h2>
      {tasks.length === 0 && <p className="muted">{empty}</p>}
      <ul className="task-list">
        {tasks.map((t) => (<TaskRow key={t.id} task={t} onToggle={onToggle} onSave={onSave} onDelete={onDelete} />))}
      </ul>
    </section>
  );
}
