import React from 'react';

function Drawer({ tx, onClose }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h3>거래 상세</h3>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-row">
          <span className="dr-label">날짜</span>
          <span className="dr-value">{tx.date}</span>
        </div>
        <div className="drawer-row">
          <span className="dr-label">항목</span>
          <span className="dr-value">{tx.title}</span>
        </div>
        <div className="drawer-row">
          <span className="dr-label">카테고리</span>
          <span className="dr-value">{tx.category}</span>
        </div>
        <div className="drawer-row">
          <span className="dr-label">금액</span>
          <span className="dr-value" style={{ color: tx.type === 'income' ? '#15803d' : '#ef4444', fontWeight: 700 }}>
            {tx.type === 'income' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}원
          </span>
        </div>
        <div className="drawer-row">
          <span className="dr-label">구분</span>
          <span className="dr-value">{tx.type === 'income' ? '수입' : '지출'}</span>
        </div>
      </div>
    </>
  );
}

export default Drawer;
