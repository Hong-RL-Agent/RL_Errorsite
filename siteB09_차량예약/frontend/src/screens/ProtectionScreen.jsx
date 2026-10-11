import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, logAction, won } from '../api';
import { useFlow } from '../flows/BookingFlow';
import { PriceLines, StepTracker } from '../components/Common';

export default function ProtectionScreen() {
  const flow = useFlow();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [choice, setChoice] = useState(flow.protectionPlanId || 0);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    let alive = true;
    api.protectionPlans().then((r) => {
      if (!alive) return;
      const list = r.data.filter((p) => !p.included);
      setPlans(list);
      const rec = list.find((p) => p.recommended);
      if (rec) flow.patch({ suggestedPlanId: rec.id });
    }).catch(() => {});
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!flow.vehicle || !flow.criteria.pickup) return undefined;
    let alive = true;
    api.quote({ ...flow.toRequest(), protectionPlanId: choice, addOns: [] }).then((r) => alive && setQuote(r.data)).catch(() => {});
    return () => { alive = false; };
  }, [choice]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!flow.vehicle || !flow.criteria.pickup) return <Navigate to="/" replace />;

  const next = () => {
    // INTENTIONAL_ERROR: B09-ERR01
    // CSV Error: 보험/옵션 강제 추가
    // Strategy: SEQUENCE_REPLAY
    // Description: 선택하지 않은 보험 옵션이 다음 예약 단계로 전달됨.
    flow.patch((s) => ({ protectionPlanId: choice || s.suggestedPlanId }));
    logAction('protection_next', `choice=${choice}`);
    navigate('/book/extras');
  };

  return (
    <div className="screen narrow">
      <StepTracker current={0} />
      <div className="book-grid">
        <section className="panel" data-bug-id="B09-ERR01">
          <h1>보험 선택</h1>
          <p className="muted">기본 보험(대인·대물)은 모든 예약에 포함돼요. 필요한 경우 추가 보험을 선택하세요.</p>
          <ul className="choice-list">
            <li>
              <label className={choice === 0 ? 'on' : ''}>
                <input type="radio" name="protection" value={0} checked={choice === 0} onChange={() => setChoice(0)} />
                <span><b>추가 보험 없음</b><em>기본 보험만 적용</em></span><span className="amt">0원</span>
              </label>
            </li>
            {plans.map((p) => (
              <li key={p.id}>
                <label className={choice === p.id ? 'on' : ''}>
                  <input type="radio" name="protection" value={p.id} checked={choice === p.id} onChange={() => setChoice(p.id)} />
                  <span><b>{p.name}{p.recommended ? ' · 인기' : ''}</b><em>{p.description}</em></span><span className="amt">{won(p.price)}/일</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="nav-row">
            <button type="button" className="btn ghost" onClick={() => navigate(-1)}>이전</button>
            <button type="button" className="btn primary" onClick={next}>다음 단계</button>
          </div>
        </section>
        <aside className="panel summary">
          <h2>{flow.vehicle.name}</h2>
          <PriceLines quote={quote} />
        </aside>
      </div>
    </div>
  );
}
