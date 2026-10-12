import React from 'react';
import { CreditCard, Landmark, Smartphone } from 'lucide-react';

export default function AccountStatus({ accounts }) {
  const formatKRW = (val) => new Intl.NumberFormat('ko-KR').format(val || 0) + '원';

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 className="card-title">
            <Landmark size={18} color="var(--mint-600)" />
            <span>계좌 및 자산 현황</span>
          </h3>
          <p className="card-subtitle">실시간 연결 금융 기관별 보유 잔액</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {accounts.map((acc) => (
          <div 
            key={acc.id}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                background: acc.account_type === 'PAY' ? '#FEF08A' : '#D1FAE5',
                color: acc.account_type === 'PAY' ? '#854D0E' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {acc.account_type === 'PAY' ? <Smartphone size={18} /> : <CreditCard size={18} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{acc.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{acc.bank}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {formatKRW(acc.balance)}
              </div>
              <span className="badge" style={{ background: '#E2E8F0', color: '#475569', fontSize: '0.7rem' }}>
                정상 연동
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
