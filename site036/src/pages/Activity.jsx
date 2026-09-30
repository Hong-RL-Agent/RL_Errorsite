import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, RefreshCw, CheckCircle2, Clock, Hash } from 'lucide-react';

export default function Activity({ showToast }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = () => {
    setLoading(true);
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>시스템 활동 및 감사 로그 (Activity)</h2>
          <p className="card-subtitle">워크스페이스 내에서 발생한 모든 요청 및 트랜잭션 기록을 실시간으로 확인합니다.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadTransactions} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> 새로고침
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Seq #</th>
                <th>작업 내용 (Action)</th>
                <th>카테고리</th>
                <th>참조 번호 (Transaction ID)</th>
                <th>상태</th>
                <th>발생 시간</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    기록된 활동 로그가 없습니다.
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#64748b' }}>#{tx.request_sequence}</td>
                    <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                      {tx.actionName || tx.type}
                    </td>
                    <td>
                      <span className="badge badge-info">{tx.type}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>
                      {tx.transaction_id}
                    </td>
                    <td>
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> {tx.status || 'completed'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
