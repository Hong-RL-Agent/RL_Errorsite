import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Shirt, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Plus, ChevronRight, X } from 'lucide-react';
import LaundryItem from '../components/LaundryItem';
import PickupCalendar from '../components/PickupCalendar';
import TimeSlotCard from '../components/TimeSlotCard';
import PriceSummary from '../components/PriceSummary';
import { api } from '../api/client';

export default function NewOrder({ initialServiceId = null, onOrderCreated, onNavigateTab }) {
  const [services, setServices] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [pickupSlots, setPickupSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId || 'srv-01');
  const [quantities, setQuantities] = useState({ 'item-01': 3, 'item-03': 1 });
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPickupDate, setSelectedPickupDate] = useState('2026-10-01');
  const [selectedPickupTime, setSelectedPickupTime] = useState('내일 밤 23:00 ~ 익일 06:00 (새벽수거)');
  const [pickupNote, setPickupNote] = useState('문 앞 프레시백에 담아두었습니다.');

  // Address Selection Portal Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const addressContainerRef = useRef(null);

  useEffect(() => {
    async function loadFormResources() {
      try {
        const [sRes, iRes, aRes, pRes] = await Promise.all([
          api.getServices(),
          api.getLaundryItems(),
          api.getAddresses(),
          api.getPickupSlots()
        ]);
        if (sRes?.services) setServices(sRes.services);
        if (iRes?.items) setAllItems(iRes.items);
        if (aRes?.addresses) {
          setAddresses(aRes.addresses);
          const defaultAddr = aRes.addresses.find(a => a.isDefault) || aRes.addresses[0];
          setSelectedAddress(defaultAddr);
        }
        if (pRes?.slots) setPickupSlots(pRes.slots);
      } catch (err) {
        console.error('Failed to load order resources:', err);
      }
    }
    loadFormResources();
  }, []);

  // INTENTIONAL BACKEND BUG: site058-SEC-469
  // React Portal 외부 클릭 감지 범위 오류:
  // Modal이 ReactDOM.createPortal을 통해 document.body에 렌더링되지만,
  // document 레벨의 mousedown 리스너가 addressContainerRef.current(인라인 컨테이너)를 기준으로
  // !addressContainerRef.current.contains(e.target)을 검사하므로,
  // Portal 내부의 주소 항목을 클릭하는 순간 외부 클릭으로 오판하여 모달이 닫히고 클릭(선택) 이벤트가 무효화됨.
  useEffect(() => {
    if (!showAddressModal) return;

    const handleOutsideClick = (e) => {
      // INTENTIONAL BACKEND BUG: site058-SEC-469
      if (addressContainerRef.current && !addressContainerRef.current.contains(e.target)) {
        setShowAddressModal(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showAddressModal]);

  const handleUpdateQuantity = (itemId, qty) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: qty
    }));
  };

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];
  const currentServiceItems = allItems.filter(i => i.serviceId === selectedServiceId);

  const selectedItemsList = allItems
    .filter(i => (quantities[i.id] || 0) > 0)
    .map(i => ({
      ...i,
      quantity: quantities[i.id]
    }));

  const totalCount = selectedItemsList.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (selectedItemsList.length === 0) {
      alert('세탁할 품목을 1개 이상 선택해 주세요.');
      return;
    }
    if (!selectedAddress) {
      alert('수거 주소를 선택해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.createOrder({
        serviceName: selectedService?.name || '맞춤 세탁 서비스',
        items: selectedItemsList,
        address: `${selectedAddress.address} ${selectedAddress.detailAddress}`,
        pickupDate: selectedPickupDate,
        pickupTime: selectedPickupTime,
        pickupNote
      });

      if (res && res.order) {
        onOrderCreated(res.order);
      }
    } catch (err) {
      setError(err.message || '주문 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
          비대면 세탁 수거 신청
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          세탁할 의류를 담고 희망 수거 일정을 지정하시면 문 앞으로 찾아갑니다.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
          {/* Left Column: Flow Inputs */}
          <div>
            {/* Step 1: Service Select */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginBottom: '14px' }}>
                1. 세탁 서비스 종류 선택
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {services.map(srv => {
                  const isSel = selectedServiceId === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      style={{
                        border: isSel ? '2px solid #16a34a' : '1px solid #e2e8f0',
                        background: isSel ? '#ecfdf5' : '#ffffff',
                        borderRadius: '10px',
                        padding: '12px 10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isSel ? '#15803d' : '#0f172a' }}>
                        {srv.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {srv.basePrice.toLocaleString()}원~
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Items & Quantities */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  2. 세탁물 품목 및 수량 선택
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  선택 품목: <strong style={{ color: '#16a34a' }}>{totalCount}개</strong>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentServiceItems.map(item => (
                  <LaundryItem
                    key={item.id}
                    item={item}
                    quantity={quantities[item.id] || 0}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>
            </div>

            {/* Step 3: Address Selection with Portal Bug Trigger */}
            <div
              ref={addressContainerRef}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  3. 수거 및 배송 주소
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  style={{
                    padding: '6px 12px',
                    background: '#ecfdf5',
                    color: '#15803d',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  주소 변경
                </button>
              </div>

              {selectedAddress ? (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{selectedAddress.label}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({selectedAddress.recipient} • {selectedAddress.phone})</span>
                  </div>
                  <div style={{ fontSize: '0.92rem', color: '#334155' }}>
                    {selectedAddress.address} {selectedAddress.detailAddress}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#64748b' }}>등록된 주소가 없습니다.</div>
              )}
            </div>

            {/* Step 4: Schedule (Calendar & Slots) */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                4. 수거 희망 일정 지정
              </h3>
              <PickupCalendar
                selectedDate={selectedPickupDate}
                onSelectDate={setSelectedPickupDate}
              />
              <TimeSlotCard
                slots={pickupSlots}
                selectedSlot={selectedPickupTime}
                onSelectSlot={setSelectedPickupTime}
              />

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  수거 요청 메시지 / 보관 위치
                </label>
                <input
                  type="text"
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                  placeholder="예: 문 앞 프레시백에 담아두었습니다."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Price & Order Action */}
          <div style={{ position: 'sticky', top: '96px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <PriceSummary
              items={selectedItemsList}
              totalCount={totalCount}
              totalPrice={totalPrice}
            />

            <button
              type="submit"
              disabled={loading || totalCount === 0}
              style={{
                width: '100%',
                padding: '16px',
                background: totalCount > 0 ? '#16a34a' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: totalCount > 0 ? 'pointer' : 'not-allowed',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={20} />
              <span>{loading ? '신청 접수 중...' : '세탁 수거 신청 완료하기'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Address Picker Rendered Via React Portal with SEC-469 outside-click trigger */}
      {showAddressModal &&
        ReactDOM.createPortal(
          <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  수거 주소지 선택
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} color="#64748b" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {addresses.map((addr) => {
                  const isSel = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setShowAddressModal(false);
                      }}
                      style={{
                        border: isSel ? '2px solid #16a34a' : '1px solid #e2e8f0',
                        background: isSel ? '#ecfdf5' : '#ffffff',
                        borderRadius: '12px',
                        padding: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{addr.label}</span>
                        {addr.isDefault && (
                          <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            기본
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {addr.address} {addr.detailAddress}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                        {addr.recipient} ({addr.phone})
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
