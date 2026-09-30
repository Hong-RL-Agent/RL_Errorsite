import React from 'react';
import { Plus, Minus } from 'lucide-react';

export default function LaundryItem({ item, quantity = 0, onUpdateQuantity }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: quantity > 0 ? '1px solid #16a34a' : '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.15s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{item.name}</h4>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.desc} • {item.estHours}시간 소요</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#16a34a' }}>
          {item.price.toLocaleString()}원
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, Math.max(0, quantity - 1))}
            disabled={quantity === 0}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: 'none',
              background: quantity > 0 ? '#ffffff' : 'transparent',
              color: quantity > 0 ? '#0f172a' : '#cbd5e1',
              cursor: quantity > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: quantity > 0 ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Minus size={14} />
          </button>

          <span style={{ width: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.92rem' }}>
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, quantity + 1)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: 'none',
              background: '#16a34a',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
