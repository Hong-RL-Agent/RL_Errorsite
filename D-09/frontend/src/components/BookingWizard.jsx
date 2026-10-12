import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Check, ChevronRight, ChevronLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { createReservation } from '../lib/api';

const TIME_SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00'];

export default function BookingWizard({
  services = [],
  pets = [],
  currentUser,
  preselectedService = null,
  preselectedPet = null,
  onBookingSuccess,
  onNotify
}) {
  const [step, setStep] = useState(1); // 1, 2, 3, 4
  const [selectedService, setSelectedService] = useState(preselectedService || null);
  const [selectedPet, setSelectedPet] = useState(preselectedPet || null);
  const [selectedDate, setSelectedDate] = useState('2026-10-20');
  const [selectedTime, setSelectedTime] = useState('11:30');
  const [pickupService, setPickupService] = useState(false);
  const [specialRequest, setSpecialRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Month navigation for mini calendar
  const [currentYearMonth, setCurrentYearMonth] = useState({ year: 2026, month: 10 });

  // Filter pets for current user
  const userPets = useMemo(() => {
    return pets.filter((p) => p.user_id === currentUser?.id);
  }, [pets, currentUser]);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (preselectedPet) {
      setSelectedPet(preselectedPet);
    } else if (userPets.length > 0 && !selectedPet) {
      setSelectedPet(userPets[0]);
    }
  }, [preselectedPet, userPets]);

  // Price Calculation
  const priceCalculation = useMemo(() => {
    const base = selectedService ? selectedService.base_price : 0;
    let weightSurcharge = 0;
    if (selectedPet) {
      if (selectedPet.weight > 20) weightSurcharge = 20000;
      else if (selectedPet.weight > 8) weightSurcharge = 10000;
    }
    const pickupFee = pickupService ? 15000 : 0;
    const total = base + weightSurcharge + pickupFee;
    return { base, weightSurcharge, pickupFee, total };
  }, [selectedService, selectedPet, pickupService]);

  // Calendar dates generator (October 2026)
  const calendarDays = useMemo(() => {
    const days = [];
    // 2026-10-01 was Thursday (index 4)
    // 31 days in October
    for (let i = 1; i <= 31; i++) {
      const dStr = `2026-10-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateString: dStr,
        isPast: i < 12
      });
    }
    return days;
  }, []);

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedPet || !selectedDate || !selectedTime) {
      onNotify && onNotify('필수 예약 정보를 모두 입력해주세요.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createReservation({
        userId: currentUser.id,
        petId: selectedPet.id,
        serviceId: selectedService.id,
        bookingDate: selectedDate,
        timeSlot: selectedTime,
        specialRequest: specialRequest.trim(),
        pickupService: pickupService ? 1 : 0
      });

      if (res.success) {
        onNotify && onNotify(`예약 [${res.data.booking_code}]이 성공적으로 등록되었습니다!`, 'success');
        onBookingSuccess && onBookingSuccess(res.data);
      }
    } catch (err) {
      onNotify && onNotify(err.message || '예약 신청 실패', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wizard-box">
      {/* Steps Bar */}
      <div className="wizard-steps-bar">
        <div className={`step-indicator ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
          <div className="step-number">{step > 1 ? <Check size={16} /> : '1'}</div>
          <span>1. 서비스 선택</span>
        </div>
        <div style={{ flex: 1, height: '2px', background: step > 1 ? '#3B82A6' : '#EDE8DF', margin: '0 12px' }} />

        <div className={`step-indicator ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
          <div className="step-number">{step > 2 ? <Check size={16} /> : '2'}</div>
          <span>2. 반려동물 선택</span>
        </div>
        <div style={{ flex: 1, height: '2px', background: step > 2 ? '#3B82A6' : '#EDE8DF', margin: '0 12px' }} />

        <div className={`step-indicator ${step === 3 ? 'active' : step > 3 ? 'done' : ''}`}>
          <div className="step-number">{step > 3 ? <Check size={16} /> : '3'}</div>
          <span>3. 날짜 및 시간</span>
        </div>
        <div style={{ flex: 1, height: '2px', background: step > 3 ? '#3B82A6' : '#EDE8DF', margin: '0 12px' }} />

        <div className={`step-indicator ${step === 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <span>4. 견적 & 확인</span>
        </div>
      </div>

      {/* STEP 1: 서비스 선택 */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
            어떤 케어 서비스를 이용하시겠어요?
          </h3>
          <p style={{ fontSize: '13px', color: '#718096', marginBottom: '20px' }}>
            원하시는 케어 프로그램을 선택해주세요.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {services.map((s) => {
              const isSelected = selectedService?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid #3B82A6' : '1.5px solid #EDE8DF',
                    background: isSelected ? '#EBF4F6' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{s.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#3B82A6' }}>
                      {s.duration_mins}분
                    </span>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#2D3748', marginBottom: '4px' }}>
                    {s.name}
                  </h4>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#3B82A6' }}>
                    {s.base_price.toLocaleString()}원
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              disabled={!selectedService}
              onClick={() => setStep(2)}
            >
              <span>다음: 반려동물 선택</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: 반려동물 선택 */}
      {step === 2 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
            어떤 아이를 위해 예약하시나요?
          </h3>
          <p style={{ fontSize: '13px', color: '#718096', marginBottom: '20px' }}>
            {currentUser?.name} 보호자님의 등록된 반려동물 중 케어를 받을 아이를 선택해주세요.
          </p>

          {userPets.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', background: '#FAF5ED', borderRadius: '16px', marginBottom: '24px' }}>
              <p style={{ marginBottom: '12px', fontWeight: '700' }}>현재 계정에 등록된 반려동물이 없습니다.</p>
              <p style={{ fontSize: '12px', color: '#718096' }}>상단 마이 펫룸에서 반려동물을 먼저 등록해주세요.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {userPets.map((pet) => {
                const isSelected = selectedPet?.id === pet.id;
                return (
                  <div
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #FF6B6B' : '1.5px solid #EDE8DF',
                      background: isSelected ? '#FFF0F0' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '28px' }}>{pet.avatar || '🐾'}</span>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#2D3748' }}>
                          {pet.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#718096' }}>
                          {pet.breed} • {pet.age}살
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>
                      체중: <strong style={{ color: '#2D3748' }}>{pet.weight} kg</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              <ChevronLeft size={16} />
              <span>이전 단계</span>
            </button>
            <button
              className="btn btn-primary"
              disabled={!selectedPet}
              onClick={() => setStep(3)}
            >
              <span>다음: 날짜 및 시간 선택</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 날짜 및 시간 선택 */}
      {step === 3 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
            방문 희망 날짜와 시간을 선택해주세요
          </h3>
          <p style={{ fontSize: '13px', color: '#718096', marginBottom: '20px' }}>
            선택된 서비스: <strong>{selectedService?.name}</strong> | 반려동물: <strong>{selectedPet?.name}</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Calendar */}
            <div className="calendar-wrapper">
              <div className="calendar-header">
                <span style={{ fontWeight: '800', fontSize: '15px' }}>2026년 10월</span>
                <span style={{ fontSize: '12px', color: '#3B82A6', fontWeight: '700' }}>PawCare Studio</span>
              </div>
              <div className="calendar-grid">
                {['일', '월', '화', '수', '목', '금', '토'].map((dw) => (
                  <div key={dw} className="calendar-day-header">{dw}</div>
                ))}
                {/* 2026-10-01 is Thursday (4 empty cells: Sun, Mon, Tue, Wed) */}
                {[...Array(4)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {calendarDays.map((cd) => (
                  <button
                    type="button"
                    key={cd.dateString}
                    disabled={cd.isPast}
                    className={`calendar-cell ${cd.isPast ? 'disabled' : ''} ${selectedDate === cd.dateString ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(cd.dateString)}
                  >
                    {cd.dayNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#3B82A6" />
                <span>시간대 선택 (선택 날짜: {selectedDate})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {TIME_SLOTS.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      type="button"
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #3B82A6' : '1.5px solid #EDE8DF',
                        background: isSelected ? '#3B82A6' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#2D3748',
                        fontWeight: '700',
                        fontSize: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{time}</span>
                      <span style={{ fontSize: '11px', opacity: isSelected ? 1 : 0.6 }}>
                        {isSelected ? '선택됨' : '예약 가능'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>
              <ChevronLeft size={16} />
              <span>이전 단계</span>
            </button>
            <button
              className="btn btn-primary"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(4)}
            >
              <span>다음: 예약 견적 & 확인</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: 견적 & 최종 확인 */}
      {step === 4 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
            예약 신청 내용을 최종 확인해주세요
          </h3>
          <p style={{ fontSize: '13px', color: '#718096', marginBottom: '20px' }}>
            입력하신 정보를 바탕으로 산출된 견적서입니다.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Left: Additional Options & Requests */}
            <div>
              <div style={{ background: '#FAF5ED', padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={pickupService}
                    onChange={(e) => setPickupService(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#3B82A6' }}
                  />
                  <span>안심 왕복 픽업 서비스 신청 (+15,000원)</span>
                </label>
                <p style={{ fontSize: '11px', color: '#718096', marginTop: '6px', paddingLeft: '28px' }}>
                  전용 이동 차량으로 자택 문 앞까지 안전하게 픽업 & 샌딩해 드립니다.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">매니저 전달사항 및 특이사항</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="예: 얼굴 곰돌이컷 부탁드립니다, 스파 거품 농도 조절 요망 등..."
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                />
              </div>

              <div style={{ background: '#EBF4F6', padding: '12px 14px', borderRadius: '12px', fontSize: '12px', color: '#2B6C8A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} />
                <span>예약 완료 즉시 배정되며, 24시간 전까지 무료 취소 가능합니다.</span>
              </div>
            </div>

            {/* Right: Receipt Breakdown */}
            <div className="receipt-card">
              <div className="receipt-header">
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '16px' }}>{selectedService?.name}</h4>
                  <span style={{ fontSize: '12px', color: '#718096' }}>
                    {selectedPet?.avatar} {selectedPet?.name} ({selectedPet?.breed})
                  </span>
                </div>
                <span className="badge-status status-confirmed">확인 대기</span>
              </div>

              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>예약 일시</span>
                  <span style={{ fontWeight: '700' }}>{selectedDate} {selectedTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>기본 서비스 요금</span>
                  <span>{priceCalculation.base.toLocaleString()}원</span>
                </div>
                {priceCalculation.weightSurcharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#718096' }}>체중 구간 할증 ({selectedPet?.weight}kg)</span>
                    <span>+{priceCalculation.weightSurcharge.toLocaleString()}원</span>
                  </div>
                )}
                {priceCalculation.pickupFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#718096' }}>안심 왕복 픽업</span>
                    <span>+{priceCalculation.pickupFee.toLocaleString()}원</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '2px dashed #EDE8DF', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '17px', fontWeight: '800', color: '#3B82A6' }}>
                <span>최종 결제 예상액</span>
                <span>{priceCalculation.total.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(3)}>
              <ChevronLeft size={16} />
              <span>이전 단계</span>
            </button>
            <button
              className="btn btn-primary"
              disabled={submitting}
              onClick={handleConfirmBooking}
            >
              <Check size={16} />
              <span>{submitting ? '신청 중...' : '예약 확정하기'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
