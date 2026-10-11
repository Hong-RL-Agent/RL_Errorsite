import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, fmtDT, logAction, won } from '../api';
import { useFlow } from '../flows/BookingFlow';
import Gallery from '../components/Gallery';
import { PriceLines, SpecRow, StatusBadge } from '../components/Common';

export default function VehicleScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const flow = useFlow();
  const [v, setV] = useState(null);
  const [busy, setBusy] = useState([]);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([api.vehicle(id), api.availability(id)])
      .then(([a, b]) => { if (alive) { setV(a.data); setBusy(b.data.busy); } })
      .catch((e) => alive && setError(e.status === 404 ? '존재하지 않는 차량이에요.' : e.message));
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (!flow.criteria.pickup || !flow.returnDepot || !flow.startAt || !flow.endAt) return undefined;
    let alive = true;
    api.quote({ vehicleId: Number(id), pickupDepotId: flow.criteria.pickup.id, returnDepotId: flow.returnDepot.id, startAt: flow.startAt, endAt: flow.endAt })
      .then((r) => alive && setQuote(r.data)).catch(() => alive && setQuote(null));
    return () => { alive = false; };
  }, [id, flow.criteria.pickup, flow.returnDepot, flow.startAt, flow.endAt]);

  if (error) return <div className="screen"><div className="empty">{error}</div></div>;
  if (!v) return <div className="screen"><p className="muted">차량 정보를 불러오는 중…</p></div>;

  const name = `${v.model.make} ${v.model.name}`;
  const select = () => {
    flow.patch({ vehicle: { id: v.id, name, dailyRate: v.dailyRate, categoryName: v.model.categoryName, thumbnailUrl: v.thumbnailUrl }, protectionPlanId: 0, addOns: {} });
    logAction('select_vehicle', String(v.id));
    navigate('/book/protection');
  };
  const canBook = flow.criteria.pickup && quote && quote.available && v.status !== 'maintenance';

  return (
    <div className="screen">
      <button type="button" className="link" onClick={() => navigate(-1)}>‹ 검색 결과로</button>
      <div className="detail-grid">
        <Gallery images={v.images} title={name} />
        <div className="detail-info">
          <p className="v-cat">{v.model.categoryName} · {v.depot.city} {v.depot.name}</p>
          <h1>{name}</h1>
          <StatusBadge kind="vehicle" value={v.status} />
          <p className="v-price big"><b>{won(v.dailyRate)}</b><span>/일</span></p>
          <dl className="specs">
            <SpecRow label="차량번호" value={v.plate} />
            <SpecRow label="좌석" value={`${v.model.seats}인승`} />
            <SpecRow label="연료" value={v.model.fuelName} />
            <SpecRow label="변속기" value={v.model.transmissionName} />
            <SpecRow label="주행거리" value={`${v.odometer.toLocaleString('ko-KR')}km`} />
            <SpecRow label="출력" value={`${v.specs.horsepower}마력`} />
            <SpecRow label="구동 방식" value={v.specs.drive} />
            <SpecRow label="트렁크" value={`${v.specs.trunkLiters}L`} />
            <SpecRow label="연비" value={v.specs.efficiency} />
          </dl>
          <p className="tags">{v.specs.features.map((f) => (<span className="tag" key={f}>{f}</span>))}</p>
          <button type="button" className="btn primary big" disabled={!canBook} onClick={select}>이 차량으로 예약</button>
          {!flow.criteria.pickup && <p className="muted">먼저 차량 찾기에서 픽업 장소와 일정을 선택해 주세요.</p>}
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel">
          <h2>선택 일정 금액</h2>
          {quote ? (<><p className="muted">{fmtDT(flow.startAt)} → {fmtDT(flow.endAt)}</p><PriceLines quote={quote} />{!quote.available && <p className="alert">선택한 일정에는 예약할 수 없는 차량이에요.</p>}</>) : <p className="muted">검색 조건을 선택하면 금액을 확인할 수 있어요.</p>}
        </section>
        <section className="panel">
          <h2>예약된 일정</h2>
          {busy.length === 0 && <p className="muted">향후 90일 내 예약이 없어요.</p>}
          <ul className="plain">{busy.map((b) => (<li key={b.itineraryId}>{fmtDT(b.startAt)} → {fmtDT(b.endAt)}</li>))}</ul>
          <h2 className="mt">최근 정비 이력</h2>
          <ul className="plain">{v.maintenance.map((m) => (<li key={m.performedAt}>{m.performedAt.slice(0, 10)} · {m.kind}</li>))}</ul>
        </section>
      </div>
    </div>
  );
}
