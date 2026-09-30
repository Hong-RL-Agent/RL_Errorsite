import React, { useState, useEffect } from 'react';
import LoanCard from '../components/LoanCard';
import { api, notifyBugDetected } from '../api/client';

export default function MyLoans({ onOpenReader, onSelectBook, setActivePage, showToast }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const res = await api.getLoans();
      if (res && res.loans) {
        setLoans(res.loans);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleExtend = async (loanId) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan && loan.extensionCount >= 2) {
      // INTENTIONAL BACKEND BUG: site054-SEC-446
      notifyBugDetected({
        id: 'SEC-446',
        category: 'Business Rule',
        family: 'counter-calculation',
        severity: 'medium',
        endpoint: `/api/loans/${loanId}/extend`,
        method: 'POST',
        description: '대여 연장 한도(최대 2회)에 도달했으나 연장 횟수 검증 오류로 초과 연장이 비정상적으로 승인되는 오류'
      });
    }

    try {
      const res = await api.extendLoan(loanId);
      if (res && res.loan) {
        if (showToast) showToast(res.message || '대여가 성공적으로 연장되었습니다.', 'success');
        setLoans(prev => prev.map(l => l.id === loanId ? res.loan : l));
      }
    } catch (err) {
      if (showToast) showToast(err.message || '대여 연장 실패', 'error');
    }
  };

  const handleReturn = async (loanId) => {
    try {
      const res = await api.returnLoan(loanId);
      if (res && res.loan) {
        if (showToast) showToast('도서가 성공적으로 반납되었습니다.', 'info');
        setLoans(prev => prev.map(l => l.id === loanId ? res.loan : l));
      }
    } catch (err) {
      if (showToast) showToast(err.message || '반납 처리 실패', 'error');
    }
  };

  const activeLoans = loans.filter(l => l.status !== '반납 완료');
  const completedLoans = loans.filter(l => l.status === '반납 완료');

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>
          내 대여 서재
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          현재 대여 중인 도서의 반납 예정일 확인 및 기간 연장, 전자책 즉시 열람이 가능합니다.
        </p>
      </div>

      {/* Active Loans Section */}
      <section style={{ marginBottom: '44px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '16px' }}>
          📖 현재 대여 중인 도서 ({activeLoans.length}권)
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            대여 목록을 불러오는 중입니다...
          </div>
        ) : activeLoans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
            현재 대여 중인 도서가 없습니다.
            <div style={{ marginTop: '14px' }}>
              <button className="btn-primary-lib" onClick={() => setActivePage('books')}>
                📚 도서관에서 책 빌리기
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeLoans.map(loan => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onExtend={handleExtend}
                onReturn={handleReturn}
                onRead={onOpenReader}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed Loans History */}
      {completedLoans.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '16px' }}>
            ✅ 지난 대여 및 반납 완료 도서 ({completedLoans.length}권)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {completedLoans.map(loan => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onExtend={handleExtend}
                onReturn={handleReturn}
                onRead={onOpenReader}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
