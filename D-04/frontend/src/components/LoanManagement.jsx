import React, { useState } from 'react';
import { RotateCcw, Search, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function LoanManagement({ loans, onReturnBook }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = loans.filter((l) => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = l.book_title.toLowerCase().includes(q) ||
                    l.user_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="card-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brown-900)' }}>
            도서 대출 및 반납 관리 ({filtered.length}건)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            이용자별 대출 현황 조회 및 도서 반납 접수 처리
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', padding: '6px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="도서명, 이용자명 검색..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.84rem', width: '150px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-brown' : 'btn-outline'}`}
            onClick={() => setStatusFilter('ALL')}
          >
            전체
          </button>
          <button
            className={`btn btn-sm ${statusFilter === 'BORROWED' ? 'btn-brown' : 'btn-outline'}`}
            onClick={() => setStatusFilter('BORROWED')}
          >
            대출 중
          </button>
          <button
            className={`btn btn-sm ${statusFilter === 'RETURNED' ? 'btn-brown' : 'btn-outline'}`}
            onClick={() => setStatusFilter('RETURNED')}
          >
            반납 완료
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>대출 번호</th>
              <th>도서명</th>
              <th>대출 이용자</th>
              <th>대출일자</th>
              <th>반납 예정일</th>
              <th>상태</th>
              <th style={{ textAlign: 'right' }}>반납 처리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  대출 기록이 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isBorrowed = item.status === 'BORROWED';

                return (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      LN-{item.id}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--brown-900)' }}>
                      {item.book_title}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.user_name}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                      {item.borrow_date}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                      {item.due_date}
                    </td>
                    <td>
                      <span className={`badge ${isBorrowed ? 'badge-borrowed' : 'badge-available'}`}>
                        {isBorrowed ? '대출 중' : '반납 완료'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isBorrowed ? (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: 'var(--brown-500)', color: 'var(--brown-800)' }}
                          onClick={() => onReturnBook(item.id)}
                        >
                          <RotateCcw size={13} />
                          <span>도서 반납</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          반납일: {item.return_date}
                        </span>
                      )}
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
