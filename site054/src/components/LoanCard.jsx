import React from 'react';

export default function LoanCard({ loan, onExtend, onReturn, onRead }) {
  if (!loan) return null;

  const isOverdue = loan.status === '연체';
  const isReturned = loan.status === '반납 완료';

  const getStatusBadge = () => {
    if (isReturned) {
      return <span style={{ background: '#e2e8f0', color: '#64748b', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: '800' }}>반납 완료</span>;
    }
    if (isOverdue) {
      return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: '800' }}>연체 중</span>;
    }
    return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: '800' }}>대여 중</span>;
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex',
      gap: '20px',
      boxShadow: 'var(--shadow-xs)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      {/* Thumbnail */}
      <img
        src={loan.cover}
        alt={loan.bookTitle}
        style={{ width: '80px', height: '115px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-xs)' }}
      />

      {/* Main Info */}
      <div style={{ flex: 1, minWidth: '220px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          {getStatusBadge()}
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            연장 횟수: <strong style={{ color: loan.extensionCount >= 2 ? '#ea580c' : 'var(--text-main)' }}>{loan.extensionCount} / {loan.maxExtensions}회</strong>
          </span>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '6px' }}>
          {loan.bookTitle}
        </h3>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <span>대여일: {loan.loanedAt}</span>
          <span>반납예정일: <strong style={{ color: isOverdue ? '#b91c1c' : 'var(--primary-dark)' }}>{loan.dueAt}</strong></span>
          <span>진도율: {loan.currentPage} / {loan.totalPages}p ({Math.round((loan.currentPage / loan.totalPages) * 100)}%)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {!isReturned && (
          <button
            className="btn-secondary-lib"
            style={{ padding: '8px 14px', fontSize: '0.85rem', background: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: '800' }}
            onClick={() => onRead && onRead(loan.bookId)}
          >
            📱 책 읽기
          </button>
        )}

        {!isReturned && (
          <button
            className="btn-secondary-lib btn-loan-extend"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            onClick={() => onExtend && onExtend(loan.id)}
          >
            대여 연장 ({loan.extensionCount}/{loan.maxExtensions})
          </button>
        )}

        {!isReturned && (
          <button
            className="btn-secondary-lib"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            onClick={() => onReturn && onReturn(loan.id)}
          >
            반납하기
          </button>
        )}
      </div>
    </div>
  );
}
