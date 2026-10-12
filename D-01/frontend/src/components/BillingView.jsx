import React from 'react';
import { 
  Receipt, 
  Trash2, 
  Download, 
  CreditCard, 
  CheckCircle,
  FileText
} from 'lucide-react';

export default function BillingView({ 
  billings, 
  onDeleteBilling,
  searchQuery 
}) {
  const filtered = billings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.service_name.toLowerCase().includes(q) ||
           b.invoice_num.toLowerCase().includes(q) ||
           b.payment_method.toLowerCase().includes(q);
  });

  const totalPaid = billings.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="billing-view">
      {/* Summary KPI */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">총 결제 완료 금액</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="metric-value">${totalPaid.toFixed(2)}</div>
          <div className="metric-sub">
            <span style={{ color: '#34D399', fontWeight: 600 }}>총 {billings.length}건 정산 완료</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">전자 세금계산서 및 인보이스</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' }}>
              <FileText size={20} />
            </div>
          </div>
          <div className="metric-value">전 건 발행 완료</div>
          <div className="metric-sub">
            <span>회계 자동 전송 연동됨</span>
          </div>
        </div>
      </div>

      {/* Billings Table */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">결제 내역 및 인보이스 관리</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              자동 결제 및 수동 결제된 모든 내역을 투명하게 확인하고 인보이스를 관리합니다.
            </p>
          </div>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>인보이스 번호</th>
                <th>대상 서비스</th>
                <th>결제 일자</th>
                <th>결제 수단</th>
                <th>금액</th>
                <th>상태</th>
                <th style={{ textAlign: 'right' }}>관리 / 삭제</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    조회된 결제 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.85rem',
                        color: '#A78BFA',
                        background: 'rgba(139, 92, 246, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        {item.invoice_num}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {item.service_name}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {item.billing_date}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {item.payment_method}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#F8FAFC' }}>
                      ${item.amount.toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-active">
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDeleteBilling(item.id)}
                        title="결제 내역 레코드 삭제"
                      >
                        <Trash2 size={13} />
                        <span>내역 삭제</span>
                      </button>
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
