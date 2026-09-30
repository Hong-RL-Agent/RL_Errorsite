import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Calendar as CalIcon, Clock, User, Phone, CheckCircle, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import BookingCalendar from '../components/BookingCalendar';
import TimeSlotList from '../components/TimeSlotList';
import { api } from '../api/client';

export default function Booking({
  initialVehicleId = null,
  vehicles = [],
  onBookingSuccess,
  onNavigateTab
}) {
  const [step, setStep] = useState(1);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form selections
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId || (vehicles[0]?.id || ''));
  const [selectedCenterId, setSelectedCenterId] = useState('center-01');
  const [selectedDate, setSelectedDate] = useState('2026-10-05');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('기본 차량 점검 (120개 항목 정밀진단)');
  const [customerName, setCustomerName] = useState('홍길동');
  const [customerPhone, setCustomerPhone] = useState('010-1234-5678');

  // Time slots fetched from backend
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    async function loadCenters() {
      try {
        const data = await api.getCenters();
        if (data && data.centers) {
          setCenters(data.centers);
          if (!selectedCenterId && data.centers.length > 0) {
            setSelectedCenterId(data.centers[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load centers:', err);
      }
    }
    loadCenters();
  }, []);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedCenterId || !selectedDate) return;
      try {
        const data = await api.getAvailability(selectedCenterId, selectedDate);
        if (data && data.slots) {
          setAvailableSlots(data.slots);
        }
      } catch (err) {
        console.error('Failed to load availability slots:', err);
      }
    }
    loadSlots();
  }, [selectedCenterId, selectedDate]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const selectedCenter = centers.find(c => c.id === selectedCenterId);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedCenterId || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      alert('모든 필수 예약 정보를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create Booking API request
      const res = await api.createBooking({
        vehicleId: selectedVehicleId,
        centerId: selectedCenterId,
        date: selectedDate,
        time: selectedTime,
        serviceType: selectedService,
        customerName,
        phone: customerPhone
      });

      // Advance to completed step upon HTTP 200 response
      setStep(4); // Completion
    } catch (err) {
      console.error('Booking submission error:', err);
      setError(err.message || '예약 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const serviceOptions = [
    { title: '기본 차량 점검 (120개 항목)', price: 150000, desc: '외관, 골격, 엔진룸, 하부 리프트 점검 및 OBD 스캔' },
    { title: '사고 이력 & 프레임 정밀 진단', price: 120000, desc: '도막 두께 30개 부위 측정 및 휠하우스/필러 용접 검사' },
    { title: '엔진/미션 심층 내시경 점검', price: 140000, desc: '실린더 스크래치 내시경, 미션 압력 및 누유 검사' },
    { title: '하부 부식 및 서스펜션 점검', price: 100000, desc: '쇼크업소버, 로어암, 브레이크 라인 집중 검사' },
    { title: '전자장비 및 배터리 종합 스캔', price: 110000, desc: '전장 센서 고장코드 점검 및 고전압/저전압 배터리 수명 측정' }
  ];

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          AutoCheck 차량 정밀점검 예약
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          검증된 직영 점검센터와 전문 진단사를 선택하여 안심하고 점검을 받아보세요.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator" style={{ maxWidth: '700px', margin: '0 auto 36px' }}>
        <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
          <div className="step-name">차량 & 센터 선택</div>
        </div>
        <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
          <div className="step-name">일정 & 시간대</div>
        </div>
        <div className={`step-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 3 ? '✓' : '3'}</div>
          <div className="step-name">예약자 정보 & 확인</div>
        </div>
        <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
          <div className="step-circle">4</div>
          <div className="step-name">예약 완료</div>
        </div>
      </div>

      {error && (
        <div style={{ maxWidth: '800px', margin: '0 auto 24px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: 차량 & 센터 선택 */}
      {step === 1 && (
        <div className="booking-flow-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
            1. 점검할 차량 및 센터를 선택하세요
          </h2>

          {/* Vehicle Select */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#334155', marginBottom: '8px' }}>
              점검 대상 차량 선택
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="search-select"
              style={{ background: '#fff', fontSize: '1rem', padding: '14px' }}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.brand}] {v.model} ({v.year}년식 / {v.region})
                </option>
              ))}
            </select>
          </div>

          {/* Center Select */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#334155', marginBottom: '8px' }}>
              AutoCheck 직영 점검 센터 선택
            </label>
            <div className="center-select-grid">
              {centers.map((center) => {
                const isSelected = selectedCenterId === center.id;
                return (
                  <div
                    key={center.id}
                    className={`center-card-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCenterId(center.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="center-name">{center.name}</div>
                      {isSelected && <CheckCircle size={18} color="#1e40af" />}
                    </div>
                    <div className="center-address">{center.address}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>운영: {center.operatingHours}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedVehicleId || !selectedCenterId}
              style={{
                padding: '14px 28px',
                background: '#1e40af',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>다음: 일정 선택</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: 날짜 & 시간 선택 */}
      {step === 2 && (
        <div className="booking-flow-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
            2. 점검 희망 일자와 시간을 선택하세요
          </h2>

          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              선택 센터: <strong style={{ color: '#0f172a' }}>{selectedCenter?.name}</strong> ({selectedCenter?.address})
            </div>
          </div>

          {/* Booking Calendar */}
          <BookingCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          {/* Time Slot List */}
          <TimeSlotList
            slots={availableSlots}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '12px 20px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} />
              <span>이전 단계</span>
            </button>

            <button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
              style={{
                padding: '14px 28px',
                background: (!selectedDate || !selectedTime) ? '#94a3b8' : '#1e40af',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: (!selectedDate || !selectedTime) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>다음: 예약자 정보 입력</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 점검 항목 및 예약자 정보 입력 & 확인 */}
      {step === 3 && (
        <div className="booking-flow-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
            3. 점검 패키지 선택 및 예약자 정보
          </h2>

          <form onSubmit={handleBookingSubmit}>
            {/* Service Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#334155', marginBottom: '10px' }}>
                점검 서비스 패키지 선택
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {serviceOptions.map((opt, i) => (
                  <label
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      border: selectedService === opt.title ? '2px solid #1e40af' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: selectedService === opt.title ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        name="serviceOption"
                        checked={selectedService === opt.title}
                        onChange={() => setSelectedService(opt.title)}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{opt.title}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{opt.desc}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '1rem' }}>
                      {opt.price.toLocaleString()}원
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div className="search-group">
                <label className="search-label">예약자 성명</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="search-input"
                  placeholder="예: 홍길동"
                />
              </div>

              <div className="search-group">
                <label className="search-label">휴대폰 번호</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="search-input"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            {/* Final Booking Summary Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                최종 예약 확인 내역
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.9rem' }}>
                <div><span style={{ color: '#64748b' }}>차량:</span> <strong>{selectedVehicle?.model}</strong></div>
                <div><span style={{ color: '#64748b' }}>점검 센터:</span> <strong>{selectedCenter?.name}</strong></div>
                <div><span style={{ color: '#64748b' }}>예약 일시:</span> <strong>{selectedDate} {selectedTime}</strong></div>
                <div><span style={{ color: '#64748b' }}>예약자:</span> <strong>{customerName} ({customerPhone})</strong></div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b' }}>선택 항목:</span> <strong>{selectedService}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '12px 20px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                이전 단계
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 32px',
                  background: '#1e40af',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '예약 접수 중...' : '예약 확정하기'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 4: 예약 완료 화면 */}
      {step === 4 && (
        <div className="booking-flow-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#15803d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            점검 예약이 완료되었습니다!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '28px' }}>
            예약일시에 맞춰 센터로 방문해 주시기 바랍니다. 카카오톡 알림톡이 발송되었습니다.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '32px', fontSize: '0.92rem' }}>
            <div style={{ marginBottom: '8px' }}><span style={{ color: '#64748b' }}>점검 대상:</span> <strong>{selectedVehicle?.model}</strong></div>
            <div style={{ marginBottom: '8px' }}><span style={{ color: '#64748b' }}>방문 센터:</span> <strong>{selectedCenter?.name}</strong></div>
            <div style={{ marginBottom: '8px' }}><span style={{ color: '#64748b' }}>예약 일시:</span> <strong>{selectedDate} {selectedTime}</strong></div>
            <div><span style={{ color: '#64748b' }}>결제 방식:</span> <strong>현장 결제 (카드 / 계좌이체)</strong></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => onNavigateTab('my-bookings')}
              style={{
                padding: '12px 24px',
                background: '#1e40af',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              내 예약 내역 확인
            </button>
            <button
              onClick={() => onNavigateTab('home')}
              style={{
                padding: '12px 24px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              홈으로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
