import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Clock, CheckCircle2, ArrowUpDown, RefreshCw, Hash, Shield } from 'lucide-react';

export default function Activity() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'tag': return <span className="badge badge-indigo">콘텐츠 태그</span>;
      case 'invite': return <span className="badge badge-purple">팀원 초대</span>;
      case 'shipMemo': return <span className="badge badge-emerald">배송 메모</span>;
      case 'refund': return <span className="badge badge-coral">환불 요청</span>;
      case 'suggest': return <span className="badge badge-indigo">검색 제안</span>;
      case 'notification': return <span className="badge badge-purple">알림 관리</span>;
      case 'calendar': return <span className="badge badge-coral">캘린더 일정</span>;
      case 'report': return <span className="badge badge-indigo">리포트 필터</span>;
      case 'csv': return <span className="badge badge-emerald">CSV 임포트</span>;
      case 'apiQuery': return <span className="badge badge-purple">API 쿼리</span>;
      default: return <span className="badge badge-gray">{type}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">활동 내역 & 트랜잭션 기록</h1>
          <p className="page-subtitle">플랫폼에서 발생한 모든 사용자 요청과 트랜잭션 처리 로그를 확인합니다.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchTransactions} disabled={loading}>
          <RefreshCw size={15} /> 새로고침
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ActivityIcon size={18} color="var(--primary-color)" /> 전체 트랜잭션 이력 ({transactions.length}건)
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>불러오는 중...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>트랜잭션 ID</th>
                  <th>작업 내역 (Action)</th>
                  <th>구분</th>
                  <th>상태</th>
                  <th>처리 시간</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      기록된 트랜잭션이 없습니다.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.transaction_id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>#{tx.request_sequence}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-color)', fontSize: '13px' }}>
                        {tx.transaction_id}
                      </td>
                      <td style={{ fontWeight: 500 }}>{tx.actionName || '요청 처리'}</td>
                      <td>{getTypeBadge(tx.type)}</td>
                      <td>
                        <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={11} /> {tx.status || 'Completed'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.time || tx.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
