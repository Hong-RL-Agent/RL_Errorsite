import React from 'react';

function TransactionList({ transactions, addToast }) {
  
  const handleRefresh = () => {
    addToast('Syncing with ledger...');
    
    // INTENTIONAL GUI BUG: site016-bug03
    // 엄격한 파싱에 의한 화면 마비
    // 잘못된 형식의 데이터를 JSON.parse 시도하여 에러를 발생시킴.
    // 이 에러가 상위 바운더리에서 잡히지 않으면 전체 JS 실행이 중단되거나 리액트 트리가 깨짐.
    try {
      const malformedData = "{ 'id': 101, 'status': 'Pending' "; // Missing closing brace
      const parsed = JSON.parse(malformedData); 
      console.log(parsed);
    } catch (e) {
      // Intentional Bug: Even if caught, we might do something that crashes the UI state
      // But to truly "Freeze" or "Crash" as per CSV, we should let it throw or cause a loop.
      throw new Error("Strict Parsing Error: Unexpected token ' in JSON at position 2");
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Recent Transactions</h3>
        <button 
          className="btn btn-secondary" 
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.75rem', background: '#F3F4F6' }}
          onClick={handleRefresh}
          data-bug-id="site016-bug03"
        >
          Refresh Data
        </button>
      </div>

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => addToast('Viewing transaction details...')}>
              <td style={{ color: '#999' }}>{t.date}</td>
              <td style={{ fontWeight: 500 }}>{t.desc}</td>
              <td>{t.type}</td>
              <td className={t.type === 'Deposit' ? 'amount-deposit' : 'amount-withdraw'}>
                {t.type === 'Deposit' ? '+' : '-'} ₩ {t.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
