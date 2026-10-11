import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDT, won } from '../api';

const ACTION_LABEL = { search: '검색', quote: '견적', booking_create: '예약 생성', booking_update: '예약 변경', booking_cancel: '예약 취소', pickup: '픽업', return: '반납' };

export default function LogScreen() {
  const [data, setData] = useState(null);
  const [fleet, setFleet] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([api.history(), api.fleetStatus()])
      .then(([h, f]) => { if (alive) { setData(h.data); setFleet(f.data); } })
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);

  if (error) return <div className="screen"><div className="empty">{error}</div></div>;
  if (!data) return <div className="screen"><p className="muted">불러오는 중…</p></div>;

  return (
    <div className="screen narrow">
      <h1>이용 기록</h1>
      {fleet && (
        <section className="panel">
          <h2>지역별 차량 현황</h2>
          <table className="table">
            <thead><tr><th>지역</th><th>전체</th><th>대여 가능</th><th>대여중</th><th>정비중</th></tr></thead>
            <tbody>{fleet.byCity.map((c) => (<tr key={c.city}><td>{c.city}</td><td>{c.total}</td><td>{c.available}</td><td>{c.rented}</td><td>{c.maintenance}</td></tr>))}</tbody>
          </table>
        </section>
      )}
      <section className="panel">
        <h2>대여 내역</h2>
        {data.rentals.length === 0 && <p className="muted">완료된 대여가 없어요.</p>}
        <ul className="archive-list">
          {data.rentals.map((t) => (
            <li key={t.id}>
              <span><Link to={`/trips/${t.id}`}><b>{t.code}</b></Link> · {t.vehicle.name}<br />
                <span className="muted">{fmtDT(t.startAt)} → {fmtDT(t.endAt)} · {won(t.total)}{t.returnRecord ? ` · 반납 주행 ${t.returnRecord.odometer.toLocaleString('ko-KR')}km` : ''}</span></span>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel">
        <h2>활동 로그</h2>
        <ul className="log-list">
          {data.activity.map((a) => (<li key={a.id}><span><em className="tag">{ACTION_LABEL[a.action] || a.action}</em>{a.detail}</span><span className="muted">{a.createdAt.slice(5, 16).replace('T', ' ')}</span></li>))}
        </ul>
      </section>
    </div>
  );
}
