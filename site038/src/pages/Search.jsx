import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Plus, Sparkles, TrendingUp, Tag, Filter, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Search({ onShowToast }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuggestions();
    performSearch('여행');
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/search/suggestions');
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const performSearch = async (searchTerm) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  // SEC-355: Search Suggestions
  const handleAddSuggestion = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    setLoading(true);
    try {
      // Idempotency key generated for the suggestion
      const idempotency_key = `SEARCH-SUGGEST-${newKeyword.trim().toUpperCase().replace(/\s+/g, '_')}`;

      const res = await fetch('/api/search/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          category: newCategory,
          idempotency_key
        })
      });

      const data = await res.json();
      if (data.success) {
        onShowToast({
          title: '검색 제안 키워드 등록 완료',
          message: `키워드 "${newKeyword}"이(가) 검색 제안 목록에 추가되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          txId: data.transaction_id,
          idempotency_key
        });
        setNewKeyword('');
        fetchSuggestions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">검색 & 제안 키워드 관리</h1>
          <p className="page-subtitle">콘텐츠 통합 검색 및 트렌드 키워드 제안 풀을 관리합니다.</p>
        </div>
      </div>

      <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1fr 340px' }}>
        <div>
          {/* Search bar */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <SearchIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="콘텐츠 제목, 태그, 카테고리 검색..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSearching}>
                검색
              </button>
            </form>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={13} /> 인기 검색어:
              </span>
              {suggestions.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="badge badge-purple"
                  style={{ cursor: 'pointer', border: 'none' }}
                  onClick={() => {
                    setQuery(s.keyword);
                    performSearch(s.keyword);
                  }}
                >
                  {s.keyword}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              검색 결과 ({searchResults.length}건)
            </h3>
            {searchResults.length === 0 ? (
              <div className="empty-state">
                <SearchIcon size={40} className="empty-state-icon" />
                <p className="empty-state-text">검색 결과가 없습니다. 다른 키워드로 검색해보세요.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px',
                      background: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      style={{ width: '80px', height: '52px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge badge-indigo">{item.platform}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>조회수 {item.views.toLocaleString()}</span>
                        <span>카테고리: {item.category}</span>
                        <span>게시일: {item.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SEC-355: Add Search Suggestion */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <Sparkles size={16} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>검색 제안 키워드 등록</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              콘텐츠 탐색창에 추천될 검색 제안 키워드를 직접 등록하고 관리할 수 있습니다.
            </p>

            <form onSubmit={handleAddSuggestion}>
              <div className="form-group">
                <label className="form-label">키워드 *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 여행 브이로그, 룸투어"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">카테고리</label>
                <select
                  className="form-input"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="General">일반</option>
                  <option value="Vlog">브이로그</option>
                  <option value="Tech">테크/장비</option>
                  <option value="Lifestyle">라이프스타일</option>
                  <option value="Travel">여행</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? '등록 중...' : '검색 제안 등록'}
              </button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                현재 등록된 제안 ({suggestions.length}개)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'var(--bg-main)',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{s.keyword}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
