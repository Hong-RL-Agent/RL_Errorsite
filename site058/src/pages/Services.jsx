import React, { useState, useEffect } from 'react';
import { Shirt, Scissors, Layers, Footprints, Sparkles, Shield, Award, Maximize, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function Services({ onSelectService, onNavigateTab }) {
  const [services, setServices] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('srv-01');

  const iconMap = {
    Shirt: Shirt,
    Scissors: Scissors,
    Layers: Layers,
    Footprints: Footprints,
    Sparkles: Sparkles,
    Shield: Shield,
    Award: Award,
    Maximize: Maximize
  };

  useEffect(() => {
    async function loadData() {
      try {
        const sData = await api.getServices();
        if (sData && sData.services) setServices(sData.services);
        const iData = await api.getLaundryItems();
        if (iData && iData.items) setItems(iData.items);
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    }
    loadData();
  }, []);

  const activeService = services.find(s => s.id === selectedServiceId) || services[0];
  const serviceItems = items.filter(i => i.serviceId === selectedServiceId);

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
          세탁 서비스 프로그램 & 정찰제 요금표
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          의류 섬유별 전문 맞춤 세탁 공정 및 투명한 정찰제 가격을 안내해 드립니다.
        </p>
      </div>

      {/* Services Tabs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {services.map((srv) => {
          const isSelected = selectedServiceId === srv.id;
          const IconComp = iconMap[srv.icon] || Shirt;

          return (
            <div
              key={srv.id}
              onClick={() => setSelectedServiceId(srv.id)}
              style={{
                border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                background: isSelected ? '#ecfdf5' : '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isSelected ? '#16a34a' : '#f1f5f9', color: isSelected ? '#ffffff' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: isSelected ? '#15803d' : '#0f172a', fontSize: '0.95rem' }}>
                  {srv.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {srv.basePrice.toLocaleString()}원부터
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Service Detail Panel */}
      {activeService && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '32px', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', background: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px' }}>
                {activeService.badge || '전문 세탁'}
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '8px 0 6px' }}>
                {activeService.name}
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#475569' }}>
                {activeService.description}
              </p>
            </div>

            <button
              onClick={() => onSelectService(activeService.id)}
              style={{
                padding: '12px 24px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>이 서비스로 신청하기</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            해당 세탁 품목 및 정찰제 요금
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {serviceItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 900, color: '#16a34a', fontSize: '1.05rem' }}>
                  {item.price.toLocaleString()}원
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
