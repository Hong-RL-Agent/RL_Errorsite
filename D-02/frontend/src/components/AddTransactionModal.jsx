import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  categories, 
  accounts, 
  onSubmit 
}) {
  if (!isOpen) return null;

  const [type, setType] = useState('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 1);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !title) return;

    const chosenCatId = categoryId || filteredCategories[0]?.id || 1;

    onSubmit({
      type,
      category_id: Number(chosenCatId),
      account_id: Number(accountId),
      amount: Number(amount),
      title,
      memo,
      transaction_date: date
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={20} color="var(--mint-600)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>새 거래 내역 추가</h3>
          </div>
          <button className="btn btn-outline btn-sm" style={{ padding: '4px', borderRadius: '50%' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type selector (Expense / Income) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className={`btn ${type === 'EXPENSE' ? 'btn-danger' : 'btn-outline'}`}
                onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
              >
                지출 (Expense)
              </button>
              <button
                type="button"
                className={`btn ${type === 'INCOME' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setType('INCOME'); setCategoryId(''); }}
              >
                수입 (Income)
              </button>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">거래명 / 내역명 *</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 점심식사, 마트 장보기, 급여 입금"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">금액 (원) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="숫자만 입력 (예: 25000)"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">카테고리 *</label>
              <select
                className="form-select"
                value={categoryId || filteredCategories[0]?.id || ''}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Account */}
            <div className="form-group">
              <label className="form-label">결제 계좌 / 수단 *</label>
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

            {/* Date */}
            <div className="form-group">
              <label className="form-label">거래 일자 *</label>
              <input
                type="date"
                className="form-input"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Memo */}
            <div className="form-group">
              <label className="form-label">상세 메모</label>
              <input
                type="text"
                className="form-input"
                placeholder="특이사항 또는 영수증 메모"
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
              거래 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
