import React from 'react';

function TransactionTable({ transactions, onRowClick }) {
  return (
    <div className="table-section">
      <h2>거래 내역</h2>
      {/* data-bug-id for bug03: 이 컨테이너에 CSS bug03이 적용됨 */}
      <div className="table-wrapper" data-bug-id="site012-bug03">
        <table className="tx-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>분류</th>
              <th>내용</th>
              <th>금액</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>거래 내역이 없습니다.</td></tr>
            ) : (
              transactions.map(tx => (
                <tr key={tx.id} onClick={() => onRowClick(tx)}>
                  <td>{tx.date}</td>
                  <td>
                    <span className={`category-badge ${tx.type === 'expense' ? 'expense' : ''}`}>
                      {tx.category}
                    </span>
                  </td>
                  <td>{tx.title}</td>
                  <td className={`amount-cell ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}원
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionTable;
