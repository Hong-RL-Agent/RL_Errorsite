import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import EventEditor, { formFromEvent } from '../components/EventEditor';

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bumpData, toast } = useApp();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.event(id).then((r) => alive && setEvent(r.data)).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [id]);

  const save = async (form, { applyToSeries }) => {
    await api.updateEvent(id, { ...form, applyToSeries });
    bumpData();
    toast('일정을 수정했어요.');
    navigate(`/events/${id}`, { replace: true });
  };

  if (error) return <div className="card"><p>{error}</p></div>;
  if (!event) return <p className="muted">일정을 불러오는 중…</p>;

  return (
    <div className="single-col">
      <div className="toolbar"><h1>일정 수정</h1></div>
      <section className="card">
        <EventEditor
          key={event.id}
          variant="page"
          mode="edit"
          initial={formFromEvent(event)}
          draftKey={`edit-${event.id}`}
          isSeries={!!event.recurringId}
          onPreview={(draft) => navigate('/preview', { state: { draft, mode: 'edit', eventId: event.id } })}
          onSubmit={save}
          onCancel={() => navigate(-1)}
        />
      </section>
    </div>
  );
}
