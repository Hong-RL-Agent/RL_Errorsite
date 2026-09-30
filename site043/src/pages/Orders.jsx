import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, XCircle, ArrowRight, RotateCw, AlertTriangle } from 'lucide-react';

export default function Orders({ showToast }) {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!confirm('해당 주문을 취소하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('주문이 취소되었습니다.', 'info');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-399: Trigger shipping transition on a cancelled order
  const handleSimulateShipping = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          memo: `물류센터 자동 출고 스캔 [${newStatus}]`
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          data.message,
          data.bugId || 'site043-bug04',
          data.secId || 'SEC-399'
        );
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span style={{ background: '#fbf5ee', color: '#855b32', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>주문 완료</span>;
      case 'preparing':
        return <span style={{ background: '#eef2eb', color: '#5b6b4e', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>상품 준비중</span>;
      case 'shipped':
        return <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>배송중 (출고완료)</span>;
      case 'delivered':
        return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>배송 완료</span>;
      case 'cancelled':
        return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>주문 취소됨</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>주문 & 배송 현황 ({orders.length}건)</h2>
          <p>회원님의 가구 안전 배송 진행 상황 및 과거 주문 내역입니다.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e9e3da',
              padding: 24
            }}
          >
            {/* Order Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e9e3da', paddingBottom: 16, marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 13, color: '#6b645b' }}>주문번호: </span>
                <span style={{ fontWeight: 800, color: '#1f1d1a' }}>{order.id}</span>
                <span style={{ fontSize: 12, color: '#9e968b', marginLeft: 12 }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1f1d1a' }}>
                    {item.name}
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#6b645b', marginLeft: 8 }}>
                      ({item.color} · {item.quantity}개)
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#855b32' }}>
                    {(item.price * item.quantity).toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>

            {/* Order Actions / Testing Trigger */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f6f3ee', paddingTop: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 13, color: '#6b645b' }}>
                배송지: {order.shippingAddress}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e9e3da', background: '#fff', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    주문 취소
                  </button>
                )}

                {/* Simulated carrier status transition trigger (SEC-399) */}
                {order.status === 'cancelled' && (
                  <button
                    onClick={() => handleSimulateShipping(order.id, 'shipped')}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #855b32', background: '#fbf5ee', color: '#855b32', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    title="취소된 주문을 물류센터에서 출고/배송중으로 변경 시뮬레이션"
                  >
                    <Truck size={15} />
                    물류 출고 배송중 전환
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
