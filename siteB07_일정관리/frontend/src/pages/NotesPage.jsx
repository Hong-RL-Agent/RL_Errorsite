import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, logAction } from '../api';
import { useApp } from '../context/AppContext';

function NoteItem({ note, onSaved }) {
  const { guardOnline, toast } = useApp();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(note.body);

  const save = async () => {
    if (!guardOnline()) return;
    try {
      const res = await api.updateNote(note.id, body);
      onSaved(res.data);
      setEditing(false);
      toast('메모를 수정했어요.');
    } catch (e) { toast(e.message); }
  };

  return (
    <li className="note-item">
      {editing ? (
        <>
          <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} aria-label="메모 수정" />
          <div className="editor-actions">
            <button type="button" className="btn small ghost" onClick={() => { setEditing(false); setBody(note.body); }}>취소</button>
            <button type="button" className="btn small primary" onClick={save}>수정 저장</button>
          </div>
        </>
      ) : (
        <>
          <p>{note.body}</p>
          <span className="muted tiny">{new Date(note.updatedAt).toLocaleString('ko-KR')}</span>
          <button type="button" className="link-btn" onClick={() => setEditing(true)}>수정</button>
        </>
      )}
    </li>
  );
}

export default function NotesPage() {
  const { id } = useParams();
  const { offline, guardOnline, toast, bumpData } = useApp();
  const [event, setEvent] = useState(null);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');

  // INTENTIONAL_ERROR: B07-ERR05
  // CSV Error: 오프라인 입력 데이터 휘발
  // Strategy: STATE_REVISIT
  // Description: 오프라인 모드에서 작성 중인 메모를 React 메모리 상태에만 보관하고 임시 저장소에 쓰지 않아 새로고침 시 사라짐.
  const [draft, setDraft] = useState('');

  const load = useCallback(() => {
    Promise.all([api.event(id), api.notes(id)])
      .then(([e, n]) => { setEvent(e.data); setNotes(n.data); })
      .catch((err) => setError(err.message));
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!draft.trim()) { toast('메모 내용을 입력해 주세요.'); return; }
    if (!guardOnline()) return;
    try {
      const res = await api.createNote(id, draft);
      setNotes((list) => [...list, res.data]);
      setDraft('');
      bumpData();
      logAction('note_saved', id);
      toast('메모를 저장했어요.');
    } catch (err) { toast(err.message); }
  };

  if (error) return <div className="card"><p>{error}</p></div>;
  if (!event) return <p className="muted">메모를 불러오는 중…</p>;

  return (
    <div className="single-col">
      <div className="toolbar">
        <h1>메모 · {event.title}</h1>
        <div className="top-spacer" />
        <Link className="btn small" to={`/events/${event.id}`}>일정 상세</Link>
      </div>

      <section className="card" data-bug-id="B07-ERR05">
        <h2>새 메모 작성</h2>
        <form onSubmit={save} className="note-form">
          <textarea name="noteBody" rows={5} value={draft} maxLength={2000} onChange={(e) => setDraft(e.target.value)} placeholder="일정에 대한 메모를 남겨 보세요" aria-label="새 메모" />
          <div className="editor-actions">
            <span className="muted tiny">{draft.length}/2000</span>
            {offline && draft && <span className="chip warn">오프라인 · 서버 미저장</span>}
            <button type="submit" className="btn primary">메모 저장</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>저장된 메모 <span className="muted">{notes.length}</span></h2>
        {notes.length === 0 && <p className="muted">저장된 메모가 없어요.</p>}
        <ul className="note-list">
          {notes.map((n) => (<NoteItem key={n.id} note={n} onSaved={(u) => setNotes((list) => list.map((x) => (x.id === u.id ? u : x)))} />))}
        </ul>
      </section>
    </div>
  );
}
