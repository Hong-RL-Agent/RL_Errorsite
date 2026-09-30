import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import PerformanceCard from '../components/PerformanceCard';

export default function Performances({ showToast, onBookPerformance }) {
  const [performances, setPerformances] = useState([]);
  const [sortBy, setSortBy] = useState('popularity');
  const [order, setOrder] = useState('desc');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [totalPages, setTotalPages] = useState(2);
  const [loading, setLoading] = useState(false);

  const loadPerformances = () => {
    fetch('/api/performances')
      .then(res => res.json())
      .then(data => {
        setPerformances(data);
        setTotalPages(Math.ceil(data.length / pageSize));
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadPerformances();
  }, []);

  // Sort handler (SEC-345 / site037-bug05)
  const handleApplySort = (e) => {
    e?.preventDefault();
    setLoading(true);
    const idempotency_key = `SORT-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/performances/sort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sortBy,
        order,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.results) {
        setPerformances(data.results);
        showToast('정렬 적용 완료', `공연 목록이 [${sortBy}] 기준으로 정렬되었습니다.`, 'info', data.transaction_id, data.bugId, data.secId);
      }
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  // Pagination handler (SEC-346 / site037-bug06)
  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPageNum(pageNum);
    setLoading(true);

    const idempotency_key = `PAGE-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/performances/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: pageNum,
        pageSize,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.items) {
        setPerformances(data.items);
        setTotalPages(data.totalPages);
        showToast('페이지 로드 완료', `${pageNum} 페이지 공연 목록을 불러왔습니다.`, 'info', data.transaction_id, data.bugId, data.secId);
      }
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-900)' }}>공연 예매 및 라인업</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>StageOn의 다채로운 클래식, 오케스트라, 현대무용, 연극 예매</p>
        </div>

        {/* Sort Controls (SEC-345) */}
        <form onSubmit={handleApplySort} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--dark-900)' }}>정렬 기준:</span>
          
          <select 
            className="form-control" 
            style={{ width: '130px', padding: '6px 10px', fontSize: '0.86rem' }}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="popularity">인기도순</option>
            <option value="price">티켓가격순</option>
            <option value="rating">평점순</option>
            <option value="title">공연명순</option>
          </select>

          <select 
            className="form-control" 
            style={{ width: '110px', padding: '6px 10px', fontSize: '0.86rem' }}
            value={order}
            onChange={e => setOrder(e.target.value)}
          >
            <option value="desc">내림차순 ▼</option>
            <option value="asc">오름차순 ▲</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            <ArrowUpDown size={14} /> 정렬 적용
          </button>
        </form>
      </div>

      {/* Performances Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '26px', marginBottom: '36px' }}>
        {performances.map(p => (
          <PerformanceCard 
            key={p.id} 
            performance={p} 
            onBook={onBookPerformance} 
          />
        ))}
      </div>

      {/* Pagination (SEC-346) */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
        <button 
          className="btn btn-secondary btn-sm"
          disabled={currentPageNum === 1}
          onClick={() => handlePageChange(currentPageNum - 1)}
        >
          <ChevronLeft size={16} /> 이전
        </button>

        {[...Array(totalPages || 2)].map((_, i) => (
          <button
            key={i + 1}
            className={`btn btn-sm ${currentPageNum === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minWidth: '36px' }}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button 
          className="btn btn-secondary btn-sm"
          disabled={currentPageNum === totalPages}
          onClick={() => handlePageChange(currentPageNum + 1)}
        >
          다음 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
