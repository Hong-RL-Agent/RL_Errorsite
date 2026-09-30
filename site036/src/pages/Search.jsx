import React, { useState } from 'react';
import { Search as SearchIcon, FolderKanban, FileText, Package, ArrowRight } from 'lucide-react';

export default function Search({ showToast, setCurrentPage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const idempotency_key = `SEARCH-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query.trim(),
        filters: { tab: activeTab },
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      setResults(data.results);
      showToast('검색 완료', `총 ${data.results?.totalCount || 0}개의 항목이 발견되었습니다.`, 'info', data.transaction_id);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Search Bar Box */}
      <div className="card" style={{ marginBottom: '28px', padding: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '8px' }}>
          WorkNest 통합 검색
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '20px' }}>
          프로젝트 명세서, 업무 파일, 구독 상품 및 팀 활동 기록을 한 번에 검색하세요.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="검색어를 입력하세요 (예: dashboard, mobile, starter, figma...)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: '42px', height: '48px', fontSize: '1rem' }}
            />
            <SearchIcon size={20} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 28px', height: '48px' }} disabled={loading}>
            {loading ? '검색 중...' : '검색'}
          </button>
        </form>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>추천 키워드:</span>
          {['dashboard', 'mobile', 'starter', 'spec', 'design'].map(k => (
            <button
              key={k}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 10px', fontSize: '0.78rem' }}
              onClick={() => {
                setQuery(k);
              }}
            >
              #{k}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {results && (
        <div>
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--gray-200)', marginBottom: '20px' }}>
            <button 
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveTab('all')}
            >
              전체 결과 ({results.totalCount})
            </button>
            <button 
              className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveTab('projects')}
            >
              프로젝트 ({results.projects.length})
            </button>
            <button 
              className={`btn ${activeTab === 'files' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveTab('files')}
            >
              파일 ({results.files.length})
            </button>
            <button 
              className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveTab('products')}
            >
              상품 ({results.products.length})
            </button>
          </div>

          {results.totalCount === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              검색어와 일치하는 결과가 없습니다. 다른 키워드로 검색해 보세요.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Projects */}
              {(activeTab === 'all' || activeTab === 'projects') && results.projects.map(p => (
                <div key={p.id} className="card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ background: '#eef2ff', padding: '10px', borderRadius: 'var(--radius-md)', color: '#4f46e5' }}>
                      <FolderKanban size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--navy-900)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>{p.description}</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('projects')}>
                    프로젝트 이동 <ArrowRight size={14} />
                  </button>
                </div>
              ))}

              {/* Files */}
              {(activeTab === 'all' || activeTab === 'files') && results.files.map(f => (
                <div key={f.id} className="card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ background: '#fffbeb', padding: '10px', borderRadius: 'var(--radius-md)', color: '#f59e0b' }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--navy-900)' }}>{f.name} ({f.size})</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>{f.description}</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('files')}>
                    파일함 이동 <ArrowRight size={14} />
                  </button>
                </div>
              ))}

              {/* Products */}
              {(activeTab === 'all' || activeTab === 'products') && results.products.map(pr => (
                <div key={pr.id} className="card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
                      <Package size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--navy-900)' }}>
                        {pr.name} (₩{pr.price.toLocaleString()} / {pr.interval})
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>{pr.description}</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('products')}>
                    상품 보기 <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
