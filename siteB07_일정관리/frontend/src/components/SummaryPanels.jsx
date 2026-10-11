import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import EventCard from './EventCard';

export function StatsCards() {
  const { today, dataVersion } = useApp();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let alive = true;
    api.statistics(today).then((r) => alive && setStats(r.data)).catch(() => {});
    return () => { alive = false; };
  }, [today, dataVersion]);
  if (!stats) return <div className="stat-row" aria-busy="true" />;
  return (
    <div className="stat-row">
      <div className="stat-card coral"><span>오늘 일정</span><b>{stats.today.total}</b><em>완료 {stats.today.done} · 남음 {stats.today.remaining}</em></div>
      <div className="stat-card lavender"><span>이번 주</span><b>{stats.week}</b><em>건</em></div>
      <div className="stat-card sage"><span>이번 달</span><b>{stats.month}</b><em>{stats.byCategory[0] ? `최다: ${stats.byCategory[0].name}` : ''}</em></div>
      <div className="stat-card sand"><span>할 일</span><b>{stats.openTasks}</b><em>완료 {stats.doneTasks}</em></div>
    </div>
  );
}

export function TodayList({ onSelect }) {
  const { today, dataVersion } = useApp();
  const [list, setList] = useState([]);
  useEffect(() => {
    let alive = true;
    api.events({ from: today, to: today }).then((r) => alive && setList(r.data)).catch(() => {});
    return () => { alive = false; };
  }, [today, dataVersion]);
  return (
    <section className="card">
      <h2>오늘 일정 요약</h2>
      {list.length === 0 && <p className="muted">오늘 예정된 일정이 없어요.</p>}
      <div className="stack">{list.map((ev) => (<EventCard key={ev.id} event={ev} variant="compact" onClick={onSelect} />))}</div>
    </section>
  );
}

export function MiniNotifications() {
  const { dataVersion } = useApp();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  useEffect(() => {
    let alive = true;
    api.notifications().then((r) => alive && setList(r.data.filter((n) => !n.read).slice(0, 3))).catch(() => {});
    return () => { alive = false; };
  }, [dataVersion]);
  return (
    <section className="card">
      <h2>일정 알림 <Link to="/notifications" className="more">전체 보기</Link></h2>
      {list.length === 0 && <p className="muted">새 알림이 없어요.</p>}
      <ul className="plain-list">
        {list.map((n) => (<li key={n.id}><button type="button" className="link-btn" onClick={() => navigate(`/events/${n.eventId}`)}>{n.message}</button></li>))}
      </ul>
    </section>
  );
}

export function RecentChanges() {
  const { dataVersion } = useApp();
  const [list, setList] = useState([]);
  useEffect(() => {
    let alive = true;
    api.activity(6).then((r) => alive && setList(r.data)).catch(() => {});
    return () => { alive = false; };
  }, [dataVersion]);
  return (
    <section className="card">
      <h2>최근 변경 내역 <Link to="/activity" className="more">전체 보기</Link></h2>
      {list.length === 0 && <p className="muted">변경 내역이 없어요.</p>}
      <ul className="plain-list small">{list.map((a) => (<li key={a.id}>{a.detail}</li>))}</ul>
    </section>
  );
}
