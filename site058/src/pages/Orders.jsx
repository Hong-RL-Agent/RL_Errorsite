import React, { useState, useEffect } from 'react';
import { Package, PlusCircle, RefreshCw, Filter, AlertCircle } from 'lucide-react';
import OrderCard from '../components/OrderCard';
import { api } from '../api/client';

export default function Orders({ onSelectOrder, onNavigateTab }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('전체');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrders();
      if (data && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      setError(err.message || '주문 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filterTabs = ['전체', '수거 예정', '세탁 중', '검수 중', '배송 중', '배송 완료'];

  const filteredOrders = orders.filter(o => {
    if (selectedFilter === '전체') return true;
    return o.status === selectedFilter;
  });

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
            세탁 주문 내역
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            신청하신 비대면 세탁 수거 일정 및 세탁·배송 진행 상태를 조회할 수 있습니다.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('new-order')}
          style={{
            padding: '10px 20px',
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <PlusCircle size={16} />
          <span>새 세탁 신청</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
        {filterTabs.map((tab) => {
          const isSel = selectedFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: isSel ? '1px solid #16a34a' : '1px solid transparent',
                background: isSel ? '#ecfdf5' : '#ffffff',
                color: isSel ? '#15803d' : '#64748b',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p>주문 내역을 불러오는 중입니다...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <Package size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            해당하는 세탁 주문 내역이 없습니다.
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
            간편하게 세탁물을 맡기고 편안한 일상을 시작해 보세요.
          </p>
          <button
            onClick={() => onNavigateTab('new-order')}
            style={{
              padding: '10px 20px',
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            세탁 신청하러 가기
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onSelectOrder={onSelectOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
