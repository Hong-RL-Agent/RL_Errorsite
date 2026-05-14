import React, { useState } from 'react';

function QuickTransfer({ balance, setBalance, onTransfer, addToast }) {
  const [amount, setAmount] = useState('');
  const [to, setTo] = useState('');

  const handleTransfer = async () => {
    if (!amount || isNaN(amount)) return;
    
    const transferAmount = parseInt(amount);
    
    // INTENTIONAL GUI BUG: site016-bug02
    // 낙관적 업데이트 상태 불일치
    // 성공을 가정하고 잔액을 먼저 갱신하지만, 서버 실패 시 롤백하지 않음.
    const oldBalance = balance;
    setBalance(balance - transferAmount);
    
    addToast('Processing transfer...');

    const result = await onTransfer(transferAmount);

    if (!result.success) {
      // Intentional Bug: No rollback (setBalance(oldBalance) is missing)
      addToast(`❌ Error: ${result.message}`);
      // data-bug-id="site016-bug02" is applied to the balance display area
    } else {
      addToast('✅ Transfer successful');
      setAmount('');
      setTo('');
    }
  };

  return (
    <div className="card">
      <h3 className="section-title">Quick Transfer</h3>
      <div className="input-group">
        <label>Recipient Account</label>
        <input 
          className="input-field" 
          placeholder="000-000-000000" 
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Amount (KRW)</label>
        <input 
          className="input-field" 
          placeholder="e.g. 10000" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      
      <div 
        style={{ marginBottom: '20px', fontSize: '0.85rem', color: '#6B7280' }}
        data-bug-id="site016-bug02"
      >
        Estimated Balance after transfer: 
        <strong style={{ marginLeft: '5px', color: '#111827' }}>
          ₩ {(balance).toLocaleString()}
        </strong>
      </div>

      <button className="btn btn-primary" onClick={handleTransfer}>
        TRANSFER NOW
      </button>
    </div>
  );
}

export default QuickTransfer;
