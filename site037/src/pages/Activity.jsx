import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-900)' }}>공연장 활동 및 예매 트랜잭션 기록 (Activity)</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>플랫폼에서 발생한 모든 예매, 쿠폰, 인증 및 콘텐츠 요청 감사 로그</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadTransactions} disabled={loading}>
          <RefreshCw size={14} /> 새로고침
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Seq #</th>
                <th>작업 내용 (Action)</th>
                <th>구분</th>
                <th>참조 번호 (Transaction ID)</th>
                <th>상태</th>
                <th>발생 일시</th>
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
                    <td style={{ fontWeight: 700, color: 'var(--gray-500)' }}>#{tx.request_sequence}</td>
                    <td style={{ fontWeight: 700, color: 'var(--dark-900)' }}>{tx.actionName || tx.type}</td>
                    <td><span className="badge badge-classic">{tx.type}</span></td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 800 }}>
                      {tx.transaction_id}
                    </td>
                    <td>
                      <span className="badge badge-confirmed">
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
