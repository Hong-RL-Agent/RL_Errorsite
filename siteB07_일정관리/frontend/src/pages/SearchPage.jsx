import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, logAction } from '../api';
import { useApp } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import EventCard from '../components/EventCard';
import { STATUS_LABEL } from '../utils/date';

export default function SearchPage() {
  const { categories, dataVersion } = useApp();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  // 카테고리/상태/날짜 범위 조건은 주소(쿼리스트링)에 보관한다.
  const category = sp.get('category') || '';
  const status = sp.get('status') || '';
  const from = sp.get('from') || '';
  const to = sp.get('to') || '';

  // INTENTIONAL_ERROR: B07-ERR01
  // CSV Error: 검색어 유지 실패
  // Strategy: STATE_REVISIT
  // Description: 검색 상세 화면에서 복귀할 때 이전 검색어를 복원하지 않음(검색어를 컴포넌트 지역 상태로만 보관).
  const [text, setText] = useState('');

  const keyword = useDebounce(text, 300);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.search({ q: keyword.trim(), category, status, from, to, limit: 60 })
      .then((r) => { if (alive) { setResults(r.data); setTotal(r.meta.total); setError(''); setLoading(false); logAction('search_results', `q=${keyword.trim()} n=${r.meta.total}`); } })
      .catch((e) => { if (alive) { setError(e.message); setResults([]); setTotal(0); setLoading(false); } });
    return () => { alive = false; };
  }, [keyword, category, status, from, to, dataVersion]);

  const setParam = (name) => (e) => setSp((p) => {
    const n = new URLSearchParams(p);
    if (e.target.value) n.set(name, e.target.value); else n.delete(name);
    return n;
  }, { replace: true });

  const reset = () => { setText(''); setSp({}, { replace: true }); };

  return (
    <div className="single-col">
      <div className="toolbar"><h1>일정 검색</h1></div>
      <section className="card search-card" data-bug-id="B07-ERR01">
        <form onSubmit={(e) => e.preventDefault()} className="search-form">
          <input type="search" name="q" value={text} onChange={(e) => setText(e.target.value)} placeholder="일정 제목, 장소, 메모로 검색" aria-label="일정 검색어" />
        </form>
        <div className="filter-row">
          <label>카테고리
            <select value={category} onChange={setParam('category')}>
              <option value="">전체</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </label>
          <label>상태
            <select value={status} onChange={setParam('status')}>
              <option value="">전체</option>
              {Object.entries(STATUS_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </label>
          <label>시작일<input type="date" value={from} onChange={setParam('from')} /></label>
          <label>종료일<input type="date" value={to} onChange={setParam('to')} /></label>
          <button type="button" className="btn small ghost" onClick={reset}>조건 초기화</button>
        </div>
      </section>

      <section className={`card${loading ? ' is-loading' : ''}`}>
        <h2>검색 결과 <span className="muted">{total}건</span></h2>
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && results.length === 0 && <p className="muted">조건에 맞는 일정이 없어요.</p>}
        <div className="stack">
          {results.map((ev) => (<EventCard key={ev.id} event={ev} variant="row" onClick={(e) => navigate(`/events/${e.id}`)} />))}
        </div>
      </section>
    </div>
  );
}
