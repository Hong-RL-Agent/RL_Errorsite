import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context/AppContext';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { bumpData, toast } = useApp();
  const [list, setList] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.notifications().then((r) => { setList(r.data); setError(''); }).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const mark = async (n, read) => {
    try { await api.markNotification(n.id, read); load(); bumpData(); } catch (e) { toast(e.message); }
  };

  return (
    <div className="single-col">
      <div className="toolbar"><h1>일정 알림</h1></div>
      <section className="card">
        {error && <p className="form-error">{error}</p>}
        {list.length === 0 && !error && <p className="muted">알림이 없어요.</p>}
        <ul className="noti-list">
          {list.map((n) => (
            <li key={n.id} className={n.read ? 'read' : ''}>
              <button type="button" className="noti-body" onClick={() => navigate(`/events/${n.eventId}`)}>
                <span>{n.message}</span>
                <span className="muted tiny">{n.remindAt.replace('T', ' ').slice(0, 16)}</span>
              </button>
              <button type="button" className="btn small ghost" onClick={() => mark(n, !n.read)}>{n.read ? '읽지 않음으로' : '읽음 처리'}</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
