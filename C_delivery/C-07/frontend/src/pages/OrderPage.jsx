import React, { useEffect, useState } from 'react';
import { ShoppingBag, MapPin, CheckCircle2, AlertTriangle, CreditCard, ChevronRight } from 'lucide-react';

export default function OrderPage() {
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(101);
  const [selectedAddressDetail, setSelectedAddressDetail] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  // Fetch address options for order (BUG-5 reads from snapshot cache where 102 lingers)
  useEffect(() => {
    fetch('/api/orders/1/address-options')
      .then((r) => r.json())
      .then((data) => {
        if (data.addressOptions) {
          setAddressOptions(data.addressOptions);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // When selecting address, verify real address existence via GET /api/addresses/:id
  const handleSelectAddress = async (addrId) => {
    setSelectedAddressId(addrId);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/addresses/${addrId}`);
      if (!res.ok) {
        // BUG-5: 404 for deleted address B (102)
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.message || '배송지 정보를 불러올 수 없습니다. (404 Not Found)');
        setSelectedAddressDetail(null);
        return;
      }
      const data = await res.json();
      setSelectedAddressDetail(data.address);
    } catch (err) {
      setErrorMessage('배송지 정보를 불러올 수 없습니다.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">주문서 작성 및 결제</h1>
          <p className="page-desc">배송지를 선택하고 결제를 진행하세요.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Left: Address Selector */}
        <div>
          <div className="form-card" style={{ maxWidth: '100%', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="var(--cobalt-primary)" />
              <span>배송지 선택 (Order Address Options)</span>
            </h3>

            {errorMessage && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#fb7185',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16
              }}>
                <AlertTriangle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {addressOptions.map((opt) => {
                const isSelected = selectedAddressId === opt.address_id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectAddress(opt.address_id)}
                    style={{
                      background: isSelected ? 'var(--cobalt-light)' : 'var(--bg-quartz-input)',
                      border: `1px solid ${isSelected ? 'var(--cobalt-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 10,
                      padding: '14px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s'
                    }}
                    data-order-address-id={opt.address_id}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                        {opt.label} ({opt.recipient_name})
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                        {opt.address_line1} {opt.address_line2}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} color="var(--cobalt-primary)" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="form-card" style={{ maxWidth: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={18} color="var(--cobalt-primary)" />
              <span>주문 상품</span>
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
              <span>미니멀 코튼 셔츠 (외 1건)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>45,000원</span>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div style={{
          background: 'var(--bg-quartz-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          padding: 24
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
            최종 결제 금액
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13.5, color: 'var(--text-secondary)' }}>
            <span>상품 금액</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 600 }}>45,000원</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, fontSize: 13.5, color: 'var(--text-secondary)' }}>
            <span>배송비</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-accent)', fontWeight: 600 }}>무료</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>합계</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--cobalt-primary)' }}>45,000원</span>
          </div>

          <button
            className="btn-primary-action"
            style={{ width: '100%', justifyContent: 'center', padding: 14 }}
            disabled={Boolean(errorMessage)}
            onClick={() => setIsOrderCompleted(true)}
          >
            <CreditCard size={18} />
            <span>결제하기</span>
          </button>

          {isOrderCompleted && (
            <div style={{ marginTop: 14, textAlign: 'center', color: 'var(--emerald-accent)', fontSize: 13, fontWeight: 600 }}>
              ✓ 주문이 완료되었습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
