import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function BookingModal({ space, initialDate, initialStartTime, initialEndTime, onClose, onReservationCreated }) {
  const [step, setStep] = useState(1); // 1: 일정/인원, 2: 옵션/총액, 3: 완료
  const [date, setDate] = useState(initialDate || '2026-10-15');
  const [startTime, setStartTime] = useState(initialStartTime || '10:00');
  const [endTime, setEndTime] = useState(initialEndTime || '11:00');
  const [guestCount, setGuestCount] = useState(3);
  const [guestName, setGuestName] = useState('홍길동');
  const [hasVipOption, setHasVipOption] = useState(false);
  const [customPrice, setCustomPrice] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [savedSchedule, setSavedSchedule] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Time slot options
  const timeSlots = [
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' }
  ];

  // Price calculations
  // Default base price
  const basePrice = space.price_per_hour || 50000;
  
  // Bug 3: Frontend & Backend both calculate VIP option as flat 10,000원 without multiplying by guestCount
  const vipUnitCost = 10000;
  const optionAmount = hasVipOption ? 10000 : 0; // BUG 3: missing multiplier
  const calculatedTotal = basePrice + optionAmount;

  // Handle slot click
  const handleSelectSlot = (slot) => {
    setStartTime(slot.start);
    setEndTime(slot.end);
  };

  // Step 1 -> Step 2: 일정 저장
  const handleSaveSchedule = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const selectedIso = `${date}T${startTime}:00+09:00`;
      
      // Request price preview
      const previewRes = await fetch('http://localhost:5007/api/price/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: space.id,
          guest_count: guestCount,
          options: hasVipOption ? [{ name: 'VIP 좌석', unit_price: 10000 }] : []
        })
      });
      const previewData = await previewRes.json();

      setSavedSchedule({
        date,
        startTime,
        endTime,
        selectedDisplayTime: `${date} ${startTime}`,
        iso: selectedIso
      });

      setStep(2);
    } catch (err) {
      console.error(err);
      setErrorMsg('일정 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: 예약 확인 (Final Creation)
  const handleConfirmBooking = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const selectedIso = `${date}T${startTime}:00+09:00`;
      const endIso = `${date}T${endTime}:00+09:00`;

      const options = hasVipOption ? [{ name: 'VIP 좌석', unit_price: 10000, quantity: 1 }] : [];

      const res = await fetch('http://localhost:5007/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: space.id,
          guest_name: guestName,
          guest_count: guestCount,
          start_at: selectedIso,
          end_at: endIso,
          options,
          total_price: calculatedTotal
        })
      });

      const data = await res.json();
      if (res.status === 201 || res.status === 200) {
        setBookingResult({
          reservation: data.reservation,
          selectedTime: `${date} ${startTime}`,
          savedTime: data.reservation.start_at
        });
        setStep(3);
        if (onReservationCreated) onReservationCreated();
      } else {
        setErrorMsg(data.error || '예약 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('예약 요청 처리 중 서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 15, 13, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: '700' }}>
              공간 예약 신청
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
              {space.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(12, 18, 16, 0.5)'
        }}>
          <div style={{
            flex: 1,
            padding: '12px 16px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: step >= 1 ? 'var(--brand-primary)' : 'var(--text-muted)',
            borderBottom: step === 1 ? '2px solid var(--brand-primary)' : 'none'
          }}>
            1. 일정 및 인원
          </div>
          <div style={{
            flex: 1,
            padding: '12px 16px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: step >= 2 ? 'var(--brand-primary)' : 'var(--text-muted)',
            borderBottom: step === 2 ? '2px solid var(--brand-primary)' : 'none'
          }}>
            2. 좌석 옵션 및 총액
          </div>
          <div style={{
            flex: 1,
            padding: '12px 16px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: step === 3 ? 'var(--brand-primary)' : 'var(--text-muted)',
            borderBottom: step === 3 ? '2px solid var(--brand-primary)' : 'none'
          }}>
            3. 예약 완료
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(231, 111, 81, 0.15)',
              border: '1px solid rgba(231, 111, 81, 0.3)',
              color: '#f48467',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: 일정 및 인원 선택 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Date Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  예약 일자
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                  }}
                />
              </div>

              {/* Time Slots */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  이용 시간대 선택
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {timeSlots.map(slot => {
                    const isSelected = startTime === slot.start;
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          color: isSelected ? '#0c1210' : 'var(--text-secondary)',
                          background: isSelected ? 'var(--brand-primary)' : 'var(--bg-card)',
                          border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Clock size={14} />
                        {slot.start}-{slot.end}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  이용 인원
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestCount(num)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        color: guestCount === num ? '#0c1210' : 'var(--text-secondary)',
                        background: guestCount === num ? 'var(--brand-primary)' : 'var(--bg-card)',
                        border: guestCount === num ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      {num}명
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  예약자 성함
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="예약자 성함 입력"
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Action Button: 일정 저장 */}
              <button
                onClick={handleSaveSchedule}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
              >
                <span>일정 저장</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: 좌석 옵션 및 총액 확인 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Selected Summary Card */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>선택한 공간:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{space.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>선택한 시간:</span>
                  <span style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>{date} {startTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>이용 인원:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{guestCount}명</span>
                </div>
              </div>

              {/* Seat Option Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  좌석 옵션 선택
                </label>
                <div
                  onClick={() => setHasVipOption(!hasVipOption)}
                  style={{
                    background: hasVipOption ? 'rgba(132, 169, 140, 0.12)' : 'var(--bg-card)',
                    border: hasVipOption ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={hasVipOption}
                      onChange={() => {}} // handled by parent div
                      style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        VIP 좌석 옵션
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        프리미엄 리클라이너 및 웰컴 드링크 패키지
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--brand-primary)', fontSize: '0.9rem' }}>
                    +10,000원 / 1인
                  </div>
                </div>
              </div>

              {/* Price Breakdown Details */}
              <div style={{
                background: 'rgba(12, 18, 16, 0.8)',
                padding: '18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  예약 금액 상세
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>이용 인원: {guestCount}명</span>
                  <span>{space.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>기본 예약 금액</span>
                  <span>{basePrice.toLocaleString()}원</span>
                </div>

                {hasVipOption && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>VIP 좌석: +10,000원 / 1인</span>
                    <span style={{ fontWeight: '600' }}>옵션 금액: {optionAmount.toLocaleString()}원</span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '10px',
                  marginTop: '4px'
                }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>최종 금액</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--brand-primary)' }}>
                    {calculatedTotal.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '14px' }}
                >
                  <ArrowLeft size={16} />
                  <span>이전</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="btn-primary"
                  style={{ flex: 2, padding: '14px', fontSize: '1rem' }}
                >
                  <CheckCircle2 size={18} />
                  <span>예약 확인</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 예약 완료 결과 (Timezone Shift & Collision Evidence) */}
          {step === 3 && bookingResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(132, 169, 140, 0.2)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  예약이 완료되었습니다
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  예약 번호: #{bookingResult.reservation.id}
                </p>
              </div>

              {/* Verification Comparison Card */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>공간:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{space.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>선택한 시간:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{bookingResult.selectedTime}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>예약 완료:</span>
                  <span style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>
                    {bookingResult.savedTime}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>이용 인원:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{guestCount}명</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>최종 결제 금액:</span>
                  <span style={{ fontWeight: '800', color: 'var(--brand-primary)' }}>
                    {bookingResult.reservation.total_price.toLocaleString()}원
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                확인 및 닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
