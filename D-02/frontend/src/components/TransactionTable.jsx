import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  ArrowDownLeft, 
  ArrowUpRight,
  Receipt
} from 'lucide-react';

export default function TransactionTable({ 
  transactions, 
  categories, 
  onEditTransaction, 
  onDeleteTransaction 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const formatKRW = (val) => new Intl.NumberFormat('ko-KR').format(val || 0) + '원';

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (categoryFilter !== 'ALL' && t.category_id !== Number(categoryFilter)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = t.title.toLowerCase().includes(q) ||
                    (t.memo && t.memo.toLowerCase().includes(q)) ||
                    t.category_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h3 className="card-title">
            <Receipt size={18} color="var(--mint-600)" />
            <span>상세 거래 내역 ({filtered.length}건)</span>
          </h3>
          <p className="card-subtitle">입출금 내역 검색 및 항목별 수정/삭제</p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="내역, 메모 검색..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '140px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="form-select"
            style={{ padding: '6px 10px', fontSize: '0.82rem', height: '34px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">전체 유형</option>
            <option value="INCOME">수입만 보기</option>
            <option value="EXPENSE">지출만 보기</option>
          </select>

          {/* Category Filter */}
          <select
            className="form-select"
            style={{ padding: '6px 10px', fontSize: '0.82rem', height: '34px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">전체 카테고리</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>일자</th>
              <th>유형</th>
              <th>거래명 / 내역</th>
              <th>카테고리</th>
              <th>결제 수단 / 계좌</th>
              <th style={{ textAlign: 'right' }}>금액</th>
              <th style={{ textAlign: 'right' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  조건에 해당하는 거래 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isIncome = item.type === 'INCOME';
                return (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {item.transaction_date}
                    </td>
                    <td>
                      <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
                        {isIncome ? '수입' : '지출'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.title}</div>
                        {item.memo && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.memo}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.82rem', 
                        fontWeight: 600,
                        padding: '3px 8px',
                        background: '#F1F5F9',
                        borderRadius: '4px'
                      }}>
                        {item.category_name}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {item.account_name}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: isIncome ? '#059669' : '#DC2626' }}>
                      {isIncome ? '+' : '-'}{formatKRW(item.amount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => onEditTransaction(item)}
                          title="거래 수정"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => onDeleteTransaction(item.id)}
                          title="거래 삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
