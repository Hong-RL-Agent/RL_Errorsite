import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function TrackingSearch({ onSearch }) {
  const [invoice, setInvoice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (invoice.trim()) {
      onSearch(invoice);
    }
  };

  return (
    <div className="container">
      <form className="search-card" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="송장번호를 입력해주세요 (-제외)" 
          value={invoice}
          onChange={(e) => setInvoice(e.target.value)}
          style={{ flex: 1, padding: '15px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '16px' }}
        />
        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={20} /> 조회하기
        </button>
      </form>
    </div>
  );
}
