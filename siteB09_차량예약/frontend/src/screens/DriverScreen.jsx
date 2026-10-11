import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useFlow } from '../flows/BookingFlow';
import { StepTracker } from '../components/Common';

const PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
const LICENSE_RE = /^[0-9A-Za-z-]{8,20}$/;

export default function DriverScreen() {
  const flow = useFlow();
  const navigate = useNavigate();
  const [form, setForm] = useState(flow.renter);
  const [error, setError] = useState('');

  useEffect(() => {
    if (flow.renter.name) return;
    api.driver(1).then((r) => setForm((f) => (f.name ? f : { name: r.data.name, phone: r.data.phone, email: r.data.email, licenseNo: r.data.licenseNo }))).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!flow.vehicle || !flow.criteria.pickup) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const next = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('운전자 이름을 입력해 주세요.');
    if (!PHONE_RE.test(form.phone)) return setError('연락처 형식을 확인해 주세요. (예: 010-1234-5678)');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setError('이메일 형식을 확인해 주세요.');
    if (!LICENSE_RE.test(form.licenseNo)) return setError('면허번호는 8~20자의 숫자/영문/하이픈이에요.');
    setError('');
    flow.patch({ renter: form });
    return navigate('/book/review');
  };

  return (
    <div className="screen narrow">
      <StepTracker current={2} />
      <form className="panel form-panel" onSubmit={next}>
        <h1>운전자 정보</h1>
        <label className="field"><span>이름</span><input type="text" value={form.name} onChange={set('name')} /></label>
        <label className="field"><span>연락처</span><input type="tel" value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" /></label>
        <label className="field"><span>이메일</span><input type="email" value={form.email} onChange={set('email')} /></label>
        <label className="field"><span>운전면허 번호</span><input type="text" value={form.licenseNo} onChange={set('licenseNo')} /></label>
        {error && <p className="alert" role="alert">{error}</p>}
        <div className="nav-row">
          <button type="button" className="btn ghost" onClick={() => navigate('/book/extras')}>이전</button>
          <button type="submit" className="btn primary">예약 확인으로</button>
        </div>
      </form>
    </div>
  );
}
