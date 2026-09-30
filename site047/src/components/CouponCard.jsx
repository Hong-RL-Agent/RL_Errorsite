import React from 'react';
import { Tag, Check, Copy } from 'lucide-react';

export default function CouponCard({ coupon, onApply, isSelected = false }) {
  return (
    <div 
      className="card coupon-card"
      id={`coupon-card-${coupon.code}`}
      style={{
        padding: '16px',
        border: isSelected ? '2px solid var(--sky-blue)' : '1px dashed var(--border-color)',
        backgroundColor: isSelected ? 'var(--sky-blue-light)' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: isSelected ? '#ffffff' : 'var(--warm-yellow-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#b45309'
        }}>
          <Tag size={20} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-navy)', fontFamily: 'monospace' }}>
              {coupon.code}
            </span>
            <span className="badge badge-yellow" style={{ fontSize: 11 }}>
              {coupon.discountType === 'percent' ? `${coupon.discountValue}% OFF` : `${coupon.discountValue.toLocaleString()}원 할인`}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{coupon.description}</p>
          <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>사용 기한: ~ {coupon.validUntil}</p>
        </div>
      </div>

      {onApply && (
        <button
          id={`btn-coupon-apply-${coupon.code}`}
          onClick={() => onApply(coupon)}
          className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
        >
          {isSelected ? (
            <>
              <Check size={14} /> 적용됨
            </>
          ) : (
            '쿠폰 적용'
          )}
        </button>
      )}
    </div>
  );
}
