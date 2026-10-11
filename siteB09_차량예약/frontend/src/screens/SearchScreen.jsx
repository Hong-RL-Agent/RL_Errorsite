import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, logAction } from '../api';
import { useFlow } from '../flows/BookingFlow';
import { useToast } from '../hooks/useToast';
import DepotPicker from '../components/DepotPicker';
import VehicleCard from '../components/VehicleCard';

const CATEGORIES = [['', '전체'], ['mini', '경차'], ['compact', '소형'], ['midsize', '중형'], ['suv', 'SUV'], ['van', '승합'], ['premium', '프리미엄'], ['ev', '전기차']];
const FUELS = [['', '연료 전체'], ['gasoline', '가솔린'], ['diesel', '디젤'], ['hybrid', '하이브리드'], ['electric', '전기']];
const SEATS = [['', '인원 전체'], ['4', '4인 이상'], ['5', '5인 이상'], ['7', '7인 이상'], ['9', '9인 이상']];
const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

export default function SearchScreen() {
  const flow = useFlow();
  const { criteria, setCriteria, compare, toggleCompare, startAt, endAt, returnDepot } = flow;
  const navigate = useNavigate();
  const toast = useToast();
  const [results, setResults] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => { api.fleetStatus().then((r) => setStatus(r.data)).catch(() => {}); }, []);

  const ready = !!criteria.pickup && !!returnDepot && !!startAt && !!endAt;

  const search = useMemo(() => async () => {
    setLoading(true); setError('');
    try {
      const res = await api.fleet({
        pickupDepot: criteria.pickup.id, returnDepot: returnDepot.id, start: startAt, end: endAt,
        category: criteria.category, seats: criteria.seats, fuel: criteria.fuel, sort: criteria.sort,
      });
      setResults(res.data); setMeta(res.meta);
      logAction('fleet_search', `n=${res.meta.total}`);
    } catch (e) {
      setResults([]); setError(e.message);
    } finally { setLoading(false); }
  }, [criteria.pickup, returnDepot, startAt, endAt, criteria.category, criteria.seats, criteria.fuel, criteria.sort]);

  // 필터를 바꾸면 이미 검색한 경우 결과를 다시 조회
  useEffect(() => { if (searched && ready) search(); }, [criteria.category, criteria.seats, criteria.fuel, criteria.sort]); // eslint-disable-line react-hooks/exhaustive-deps
  // 상세 화면 등에서 돌아왔을 때 이전 조건으로 결과 복원
  useEffect(() => { if (ready && !searched) { setSearched(true); search(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e) => {
    e.preventDefault();
    if (!criteria.pickup) { setError('픽업 지점을 선택해 주세요.'); return; }
    if (!returnDepot) { setError('반납 지점을 선택해 주세요.'); return; }
    if (endAt <= startAt) { setError('반납 일시는 픽업 일시보다 늦어야 해요.'); return; }
    setSearched(true);
    search();
  };

  const select = (v) => {
    flow.patch({ vehicle: { id: v.id, name: `${v.model.make} ${v.model.name}`, dailyRate: v.dailyRate, categoryName: v.model.categoryName, thumbnailUrl: v.thumbnailUrl }, protectionPlanId: 0, addOns: {} });
    logAction('select_vehicle', String(v.id));
    navigate('/book/protection');
  };

  const onCompare = (v) => {
    const has = compare.some((c) => c.id === v.id);
    if (!has && compare.length >= 3) { toast('비교는 최대 3대까지 담을 수 있어요.', 'warn'); return; }
    toggleCompare({ id: v.id, name: `${v.model.make} ${v.model.name}` });
  };

  return (
    <div className="screen">
      <form className="search-panel" onSubmit={onSubmit}>
        <div className="sp-row">
          <DepotPicker label="픽업 장소" placeholder="도시 또는 지점 검색" value={criteria.pickup} onPick={(d) => setCriteria({ pickup: d })} />
          <label className="field"><span>픽업 날짜</span><input type="date" value={criteria.startDate} onChange={(e) => setCriteria({ startDate: e.target.value })} /></label>
          <label className="field"><span>픽업 시간</span>
            <select value={criteria.startTime} onChange={(e) => setCriteria({ startTime: e.target.value })}>{TIMES.map((t) => (<option key={t}>{t}</option>))}</select>
          </label>
        </div>
        <div className="sp-row">
          {criteria.sameReturn ? (
            <div className="field"><span>반납 장소</span><div className="same-box">픽업 장소와 동일</div></div>
          ) : (
            <DepotPicker label="반납 장소" placeholder="도시 또는 지점 검색" value={criteria.ret} onPick={(d) => setCriteria({ ret: d })} />
          )}
          <label className="field"><span>반납 날짜</span><input type="date" value={criteria.endDate} min={criteria.startDate} onChange={(e) => setCriteria({ endDate: e.target.value })} /></label>
          <label className="field"><span>반납 시간</span>
            <select value={criteria.endTime} onChange={(e) => setCriteria({ endTime: e.target.value })}>{TIMES.map((t) => (<option key={t}>{t}</option>))}</select>
          </label>
        </div>
        <div className="sp-foot">
          <label className="check"><input type="checkbox" checked={!criteria.sameReturn} onChange={(e) => setCriteria({ sameReturn: !e.target.checked })} /> 다른 지점에 반납</label>
          <button type="submit" className="btn primary big">차량 조회</button>
        </div>
      </form>

      {error && <p className="alert" role="alert">{error}</p>}

      <div className="results-layout">
        <aside className="filters">
          <h2>차량 필터</h2>
          <div className="chip-col">
            {CATEGORIES.map(([v, l]) => (<button type="button" key={v} className={`chip${criteria.category === v ? ' on' : ''}`} onClick={() => setCriteria({ category: v })}>{l}</button>))}
          </div>
          <label className="field"><span>승차 인원</span><select value={criteria.seats} onChange={(e) => setCriteria({ seats: e.target.value })}>{SEATS.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}</select></label>
          <label className="field"><span>연료</span><select value={criteria.fuel} onChange={(e) => setCriteria({ fuel: e.target.value })}>{FUELS.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}</select></label>
          <label className="field"><span>정렬</span>
            <select value={criteria.sort} onChange={(e) => setCriteria({ sort: e.target.value })}>
              <option value="price_asc">가격 낮은순</option><option value="price_desc">가격 높은순</option><option value="seats_desc">좌석 많은순</option>
            </select>
          </label>
          {status && (
            <div className="fleet-status">
              <h3>전국 차량 현황</h3>
              <p><span className="dot ok" /> 대여 가능 {status.byStatus.available || 0}</p>
              <p><span className="dot rent" /> 대여중 {status.byStatus.rented || 0}</p>
              <p><span className="dot fix" /> 정비중 {status.byStatus.maintenance || 0}</p>
            </div>
          )}
        </aside>
        <section className={`results${loading ? ' loading' : ''}`}>
          {!searched && <div className="empty">픽업 장소와 일정을 선택하고 ‘차량 조회’를 눌러 주세요.</div>}
          {searched && results && (
            <>
              <p className="muted">{meta && meta.city} 지역 차량 {meta ? meta.total : 0}대</p>
              {results.length === 0 && <div className="empty">조건에 맞는 차량이 없어요.</div>}
              {results.map((v) => (
                <VehicleCard key={v.id} vehicle={v} comparing={compare.some((c) => c.id === v.id)} onDetail={(id) => navigate(`/cars/${id}`)} onToggleCompare={onCompare} onSelect={select} />
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
