import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

export default function EditTransactionModal({ 
  transaction, 
  categories, 
  accounts, 
  onClose, 
  onSubmit 
}) {
  if (!transaction) return null;

  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(transaction.amount);
  const [categoryId, setCategoryId] = useState(transaction.category_id);
  const [accountId, setAccountId] = useState(transaction.account_id);
  const [memo, setMemo] = useState(transaction.memo || '');
  const [date, setDate] = useState(transaction.transaction_date);

  useEffect(() => {
    setTitle(transaction.title);
    setAmount(transaction.amount);
    setCategoryId(transaction.category_id);
    setAccountId(transaction.account_id);
    setMemo(transaction.memo || '');
    setDate(transaction.transaction_date);
  }, [transaction]);

  const filteredCategories = categories.filter(c => c.type === transaction.type);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(transaction.id, {
      title,
      amount: Number(amount),
      category_id: Number(categoryId),
      account_id: Number(accountId),
      memo,
      transaction_date: date
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={18} color="var(--mint-600)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>거래 내역 수정</h3>
          </div>
          <button className="btn btn-outline btn-sm" style={{ padding: '4px', borderRadius: '50%' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">거래명 *</label>
              <input
                type="text"
                className="form-input"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">금액 (원) *</label>
              <input
                type="number"
                className="form-input"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">카테고리 변경 *</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">결제 계좌</label>
              <select
                className="form-select"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.bank})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">거래 일자</label>
              <input
                type="date"
                className="form-input"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">메모</label>
              <input
                type="text"
                className="form-input"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              수정사항 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
