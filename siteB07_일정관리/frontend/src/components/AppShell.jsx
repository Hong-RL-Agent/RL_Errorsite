import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import MiniCalendar from './MiniCalendar';
import Modal from './Modal';
import EventEditor, { blankForm } from './EventEditor';

const NAV = [
  ['/calendar/month', '월간 캘린더'],
  ['/calendar/week', '주간 캘린더'],
  ['/calendar/day', '일간 일정'],
  ['/search', '일정 검색'],
  ['/tasks', '할 일'],
  ['/notifications', '알림'],
  ['/activity', '변경 내역'],
];

export default function AppShell() {
  const { today, offline, setOffline, createDate, openCreate, bumpData, toast, resetAll } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const { dataVersion } = useApp();

  const params = new URLSearchParams(location.search);
  const current = params.get('date') || today;
  const view = location.pathname.startsWith('/calendar/week') ? 'week' : location.pathname.startsWith('/calendar/day') ? 'day' : 'month';

  useEffect(() => {
    let alive = true;
    api.statistics(today).then((r) => alive && setUnread(r.data.unreadNotifications)).catch(() => {});
    return () => { alive = false; };
  }, [today, dataVersion, location.pathname]);

  const createEvent = async (form) => {
    const res = await api.createEvent(form);
    openCreate(null);
    bumpData();
    toast(`‘${res.data.title}’ 일정을 저장했어요.`);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/calendar/month" className="brand"><span className="brand-mark">🪺</span>Day<b>Nest</b></NavLink>
        <button type="button" className="btn primary" onClick={() => openCreate(today)}>＋ 새 일정</button>
        <div className="top-spacer" />
        <label className={`offline-switch${offline ? ' on' : ''}`}>
          <input type="checkbox" checked={offline} onChange={(e) => setOffline(e.target.checked)} />
          <span className="knob" />
          <span className="lbl">{offline ? '오프라인 작성 중' : '온라인'}</span>
        </label>
      </header>
      {offline && <div className="offline-banner" role="status">오프라인 모드 · 입력한 내용은 서버에 저장되지 않습니다.</div>}

      <div className="body">
        <nav className="sidebar" aria-label="주요 메뉴">
          <MiniCalendar value={current} today={today} onPick={(d) => navigate(`/calendar/${view}?date=${d}`)} />
          <ul className="nav-list">
            {NAV.map(([to, label]) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => (isActive ? 'on' : '')}>
                  {label}{to === '/notifications' && unread > 0 && <span className="badge">{unread}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
          <button type="button" className="link-btn reset" onClick={resetAll}>테스트 데이터 초기화</button>
        </nav>
        <main className="content"><Outlet /></main>
      </div>

      {createDate && (
        <Modal title="새 일정 작성" onClose={() => openCreate(null)}>
          <EventEditor
            variant="modal"
            mode="create"
            initial={blankForm(createDate)}
            onSubmit={createEvent}
            onCancel={() => openCreate(null)}
          />
          <p className="muted modal-foot">
            <button type="button" className="link-btn" onClick={() => { const d = createDate; openCreate(null); navigate(`/events/new?date=${d}`); }}>전체 화면에서 자세히 작성</button>
          </p>
        </Modal>
      )}
    </div>
  );
}
