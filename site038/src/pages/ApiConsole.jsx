import React, { useState, useEffect } from 'react';
import { Terminal, Play, History, CheckCircle, Clock, Code, Database, Copy } from 'lucide-react';

export default function ApiConsole({ onShowToast }) {
  const [query, setQuery] = useState('GET /api/content?platform=youtube');
  const [history, setHistory] = useState([]);
  const [responseJson, setResponseJson] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/developer/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-360: Developer Query Execution
  const handleRunQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Deterministic idempotency key for query
      const idempotency_key = `API-QUERY-${query.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;

      const res = await fetch('/api/developer/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          idempotency_key
        })
      });

      const data = await res.json();
      if (data.success) {
        setResponseJson(data.result);
        onShowToast({
          title: 'API Query 실행 완료',
          message: `쿼리 [${query}]가 성공적으로 실행되었습니다. (상태: 200 OK)`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          txId: data.transaction_id,
          idempotency_key
        });
        fetchHistory();
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
          <h1 className="page-title">개발자 API 콘솔 & 쿼리 실행기</h1>
          <p className="page-subtitle">CreatorFlow REST API 엔드포인트를 직접 쿼리하고 응답 구조를 검증합니다.</p>
        </div>
      </div>

      <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        {/* Left: Query Input & Result */}
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <Terminal size={16} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>API 쿼리 작성</h3>
            </div>

            <form onSubmit={handleRunQuery}>
              <div className="form-group">
                <label className="form-label">HTTP 메서드 및 엔드포인트 쿼리</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="예: GET /api/content?platform=youtube"
                    style={{ fontFamily: 'monospace', fontSize: '13px' }}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Play size={14} /> {loading ? '실행 중...' : '쿼리 실행'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="badge badge-purple"
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={() => setQuery('GET /api/content?platform=youtube')}
                >
                  GET /api/content?platform=youtube
                </button>
                <button
                  type="button"
                  className="badge badge-indigo"
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={() => setQuery('GET /api/reports')}
                >
                  GET /api/reports
                </button>
                <button
                  type="button"
                  className="badge badge-gray"
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={() => setQuery('GET /api/creator/profile')}
                >
                  GET /api/creator/profile
                </button>
              </div>
            </form>
          </div>

          {/* Response Payload */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code size={15} /> 쿼리 응답 (JSON Payload)
              </h3>
              {responseJson && (
                <span className="badge badge-emerald">Status: 200 OK</span>
              )}
            </div>

            <pre
              style={{
                background: 'var(--bg-main)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)'
              }}
            >
              {responseJson
                ? JSON.stringify(responseJson, null, 2)
                : '// 쿼리를 실행하면 JSON 응답이 여기에 표시됩니다.'}
            </pre>
          </div>
        </div>

        {/* Right: Execution History */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={16} /> 쿼리 실행 이력 ({history.length}건)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
            {history.map((h) => (
              <div
                key={h.id}
                style={{
                  padding: '12px',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
                onClick={() => setQuery(h.query)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--primary-color)' }}>{h.id}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '10px' }}>{h.status}</span>
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', wordBreak: 'break-all' }}>
                  {h.query}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>응답 속도: {h.responseTime}</span>
                  <span>{h.executedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
