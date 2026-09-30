import React from 'react';
import { Calendar, Package, MapPin, ChevronRight, Clock } from 'lucide-react';

export default function OrderCard({ order, onSelectOrder }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case '수거 예정':
        return <span className="status-badge status-pickup-wait"><Clock size={13} /> 수거 예정</span>;
      case '수거 완료':
        return <span className="status-badge status-pickup-done"><Package size={13} /> 수거 완료</span>;
      case '세탁 중':
        return <span className="status-badge status-washing">💧 세탁 중</span>;
      case '검수 중':
        return <span className="status-badge status-inspecting">🔍 검수 중</span>;
      case '배송 중':
        return <span className="status-badge status-delivering">🚚 배송 중</span>;
      case '배송 완료':
        return <span className="status-badge status-completed">✨ 배송 완료</span>;
      default:
        return <span className="status-badge status-completed">{status}</span>;
    }
  };

  return (
    <div className="order-card" onClick={() => onSelectOrder(order.id)} style={{ cursor: 'pointer' }}>
      {/* Col 1: Order ID & Service */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>{order.orderNumber}</span>
          {getStatusBadge(order.status)}
        </div>
        <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
          {order.serviceName}
        </h4>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
          신청일시: {order.createdAt}
        </div>
      </div>

      {/* Col 2: Pickup & Delivery Schedule */}
      <div style={{ fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', marginBottom: '4px' }}>
          <Calendar size={15} color="#16a34a" />
          <span>수거: <strong>{order.pickupDate}</strong> ({order.pickupTime})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
          <MapPin size={15} color="#0284c7" />
          <span>{order.address}</span>
        </div>
      </div>

      {/* Col 3: Items & Price */}
      <div>
        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
          세탁물 총 <strong>{order.itemCount}개</strong>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
          {order.totalPrice.toLocaleString()}원
        </div>
      </div>

      {/* Col 4: Action */}
      <div>
        <button
          style={{
            padding: '8px 14px',
            background: '#ecfdf5',
            color: '#15803d',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <span>상세보기</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
