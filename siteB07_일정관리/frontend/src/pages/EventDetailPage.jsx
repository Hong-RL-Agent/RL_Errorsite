import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, logAction } from '../api';
import { useApp } from '../context/AppContext';
import EventEditor, { formFromEvent } from '../components/EventEditor';
import Modal from '../components/Modal';
import { REMINDER_LABEL, REPEAT_LABEL, STATUS_LABEL, labelDay } from '../utils/date';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bumpData, toast, guardOnline } = useApp();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    setEvent(null); setError('');
    api.event(id)
      .then((r) => { if (alive) { setEvent(r.data); logAction('event_detail', `${r.data.id} ${r.data.title}`); } })
      .catch((e) => alive && setError(e.status === 404 ? '존재하지 않는 일정이에요.' : e.message));
    return () => { alive = false; };
  }, [id]);

  const save = async (form, { applyToSeries }) => {
    const res = await api.updateEvent(id, { ...form, applyToSeries });
    setEvent(res.data);
    setEditing(false);
    bumpData();
    toast('일정을 수정했어요.');
  };

  const toggleDone = async () => {
    if (!guardOnline()) return;
    const next = event.status === 'done' ? 'scheduled' : 'done';
    const res = await api.updateEvent(id, { status: next });
    setEvent(res.data);
    bumpData();
    toast(next === 'done' ? '일정을 완료 처리했어요.' : '완료 표시를 해제했어요.');
  };

  const remove = async (scope) => {
    if (!guardOnline()) return;
    setBusy(true);
    try {
      await api.deleteEvent(id, scope);
      bumpData();
      toast('일정을 삭제했어요.');
      logAction('event_deleted', id);
      navigate(`/calendar/day?date=${event.startDate}`, { replace: true });
    } catch (e) {
      toast(e.message);
      setBusy(false);
    }
  };

  if (error) return <div className="card"><p>{error}</p><button type="button" className="btn" onClick={() => navigate('/calendar/month')}>캘린더로 이동</button></div>;
  if (!event) return <p className="muted">일정을 불러오는 중…</p>;

  return (
    <div className="single-col">
      <div className="toolbar">
        <button type="button" className="btn small ghost" onClick={() => navigate(-1)}>‹ 이전 화면</button>
        <div className="top-spacer" />
        {!event.deleted && (
          <>
            <button type="button" className="btn small" onClick={toggleDone}>{event.status === 'done' ? '완료 해제' : '완료 처리'}</button>
            <button type="button" className="btn small" onClick={() => setEditing(true)}>수정</button>
            <Link className="btn small" to={`/events/${event.id}/edit`}>전체 화면 수정</Link>
            <Link className="btn small" to={`/events/${event.id}/notes`}>메모 {event.notesCount}</Link>
            <button type="button" className="btn small danger" onClick={() => setConfirming(true)}>삭제</button>
          </>
        )}
      </div>

      <section className="card detail-card" style={{ '--ev': event.color }}>
        {event.deleted && <p className="notice">삭제된 일정입니다.</p>}
        <div className="detail-title"><span className="dot" /><h1>{event.title}</h1><span className={`status ${event.status}`}>{STATUS_LABEL[event.status]}</span></div>
        <dl className="kv wide">
          <dt>날짜</dt><dd>{labelDay(event.startDate)}{event.endDate !== event.startDate ? ` ~ ${labelDay(event.endDate)}` : ''}</dd>
          <dt>시간</dt><dd>{event.startTime} – {event.endTime}</dd>
          <dt>카테고리</dt><dd>{event.category}</dd>
          <dt>장소</dt><dd>{event.location || '-'}</dd>
          <dt>반복</dt><dd>{REPEAT_LABEL[event.repeatRule]}</dd>
          <dt>알림</dt><dd>{REMINDER_LABEL[event.reminder]}</dd>
          <dt>상세 메모</dt><dd>{event.description || '-'}</dd>
          <dt>수정 시각</dt><dd>{new Date(event.updatedAt).toLocaleString('ko-KR')}</dd>
        </dl>
      </section>

      <section className="card">
        <h2>수정 기록</h2>
        {event.history.length === 0 && <p className="muted">수정 기록이 없어요.</p>}
        <ul className="plain-list small">
          {event.history.map((h) => (<li key={`${h.field}-${h.createdAt}`}>{h.field}: {h.before} → {h.after}</li>))}
        </ul>
      </section>

      {editing && (
        <Modal title="일정 수정" onClose={() => setEditing(false)}>
          <EventEditor variant="modal" mode="edit" initial={formFromEvent(event)} isSeries={!!event.recurringId} onSubmit={save} onCancel={() => setEditing(false)} />
        </Modal>
      )}

      {confirming && (
        <Modal title="일정 삭제" onClose={() => setConfirming(false)}>
          <p>‘{event.title}’ 일정을 삭제할까요?</p>
          <div className="editor-actions">
            <button type="button" className="btn ghost" onClick={() => setConfirming(false)}>취소</button>
            {event.recurringId && <button type="button" className="btn danger" disabled={busy} onClick={() => remove('series')}>이후 반복 일정 모두 삭제</button>}
            <button type="button" className="btn danger" disabled={busy} onClick={() => remove()}>삭제 확정</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
