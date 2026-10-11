import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { routeMemory } from '../flows/routeMemory';
import { useToast } from '../hooks/useToast';

export default function TripEditScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [trip, setTrip] = useState(null);
  const [depots, setDepots] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([api.trip(id), api.depots()]).then(([t, d]) => {
      if (!alive) return;
      setTrip(t.data); setDepots(d.data);
      setForm({ pickupDepotId: t.data.pickupDepot.id, returnDepotId: t.data.returnDepot.id, ...t.data.renter });
    }).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.updateTrip(id, {
        pickupDepotId: Number(form.pickupDepotId), returnDepotId: Number(form.returnDepotId),
        renter: { name: form.name, phone: form.phone, email: form.email, licenseNo: form.licenseNo },
      });
      routeMemory.set(`edited:${id}`, true);
      toast('예약 정보를 수정했어요.');
      navigate(`/trips/${id}`);
    } catch (err) { setError(err.message); }
  };

  if (error && !trip) return <div className="screen"><div className="empty">{error}</div></div>;
  if (!trip || !form) return <div className="screen"><p className="muted">불러오는 중…</p></div>;
  if (!trip.actions.canEdit) return <div className="screen"><div className="empty">현재 상태에서는 예약 정보를 수정할 수 없어요.</div></div>;

  return (
    <div className="screen narrow">
      <h1>예약 정보 수정 · {trip.code}</h1>
      <form className="panel form-panel" onSubmit={save}>
        <label className="field"><span>픽업 지점</span>
          <select value={form.pickupDepotId} onChange={set('pickupDepotId')}>{depots.map((d) => (<option key={d.id} value={d.id}>{d.city} {d.name}</option>))}</select>
        </label>
        <label className="field"><span>반납 지점</span>
          <select value={form.returnDepotId} onChange={set('returnDepotId')}>{depots.map((d) => (<option key={d.id} value={d.id}>{d.city} {d.name}</option>))}</select>
        </label>
        <label className="field"><span>운전자 이름</span><input type="text" value={form.name} onChange={set('name')} /></label>
        <label className="field"><span>연락처</span><input type="tel" value={form.phone} onChange={set('phone')} /></label>
        <label className="field"><span>이메일</span><input type="email" value={form.email} onChange={set('email')} /></label>
        <label className="field"><span>운전면허 번호</span><input type="text" value={form.licenseNo} onChange={set('licenseNo')} /></label>
        {error && <p className="alert" role="alert">{error}</p>}
        <div className="nav-row">
          <button type="button" className="btn ghost" onClick={() => navigate(`/trips/${id}`)}>취소</button>
          <button type="submit" className="btn primary">수정 완료</button>
        </div>
      </form>
    </div>
  );
}
