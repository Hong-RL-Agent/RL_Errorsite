import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Building2, Stethoscope, User, Phone, FileText, CheckCircle2, ArrowRight, AlertCircle, ChevronRight } from 'lucide-react';
import AppointmentCalendar from '../components/AppointmentCalendar';
import TimeSlotGrid from '../components/TimeSlotGrid';
import AppointmentSummary from '../components/AppointmentSummary';
import { api } from '../api/client';

export default function Booking({
  initialHospitalId = null,
  initialDoctorId = null,
  hospitals = [],
  doctors = [],
  departments = [],
  onBookingSuccess,
  onNavigateTab
}) {
  const [selectedHospitalId, setSelectedHospitalId] = useState(initialHospitalId || (hospitals[0]?.id || ''));
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || '');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('이주이');
  const [patientPhone, setPatientPhone] = useState('010-3849-1928');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdAppointment, setCreatedAppointment] = useState(null);

  // Available doctors filtered by selected hospital
  const hospitalDoctors = doctors.filter(d => d.hospitalId === selectedHospitalId);

  // Update selected doctor when hospital changes
  useEffect(() => {
    if (selectedHospitalId) {
      const docs = doctors.filter(d => d.hospitalId === selectedHospitalId);
      if (docs.length > 0 && (!selectedDoctorId || !docs.some(d => d.id === selectedDoctorId))) {
        setSelectedDoctorId(docs[0].id);
      }
    }
  }, [selectedHospitalId, doctors]);

  // Load doctor availability when doctor is selected
  useEffect(() => {
    async function loadAvailability() {
      if (!selectedDoctorId) return;
      try {
        const data = await api.getDoctorAvailability(selectedDoctorId);
        if (data && data.availability) {
          setAvailableDates(data.availability);
          if (data.availability.length > 0) {
            setSelectedDate(data.availability[0].date);
          }
        }
      } catch (err) {
        console.error('Failed to load availability:', err);
      }
    }
    loadAvailability();
  }, [selectedDoctorId]);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const activeDateObj = availableDates.find(d => d.date === selectedDate);
  const slotsForDate = activeDateObj ? activeDateObj.slots : [];

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedHospitalId || !selectedDoctorId || !selectedDate || !selectedTime) {
      setError('병원, 담당 의사, 진료 날짜 및 시간을 모두 선택해 주세요.');
      return;
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      setError('예약자 성함과 연락처를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.createAppointment({
        hospitalId: selectedHospitalId,
        doctorId: selectedDoctorId,
        date: selectedDate,
        time: selectedTime,
        patientName,
        patientPhone,
        symptoms: symptoms || '일반 진료 및 상담'
      });

      if (res && res.appointment) {
        setCreatedAppointment(res.appointment);
        onBookingSuccess?.(res.appointment);
      }
    } catch (err) {
      setError(err.message || '예약 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (createdAppointment) {
    return (
      <div className="max-w-screen" style={{ paddingTop: '40px', maxWidth: '640px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '18px', padding: '36px 28px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#15803d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
            진료 예약이 완료되었습니다!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '24px' }}>
            예약 번호: <strong style={{ color: '#0284c7' }}>{createdAppointment.bookingNumber}</strong>
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '28px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>예약 병원:</span>
              <strong>{createdAppointment.hospitalName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>담당 전문의:</span>
              <strong>{createdAppointment.doctorName} ({createdAppointment.departmentName})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>예약 일시:</span>
              <strong style={{ color: '#0284c7' }}>{createdAppointment.date} {createdAppointment.time}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>예약자:</span>
              <strong>{createdAppointment.patientName} ({createdAppointment.patientPhone})</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setCreatedAppointment(null);
                setSelectedTime('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              추가 예약하기
            </button>

            <button
              onClick={() => onNavigateTab('appointments')}
              style={{
                flex: 1,
                padding: '12px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              예약 내역 확인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
          스마트 진료 예약
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          병원과 진료과목, 담당 의사를 선택하고 원하시는 진료 날짜와 시간을 지정해 주세요.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreateBooking} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
        {/* Left Form Elements */}
        <div>
          {/* Step 1: Hospital Select */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Building2 size={18} color="#0284c7" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>1. 예약 병원 선택</h3>
            </div>
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600, background: '#f8fafc' }}
            >
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name} ({h.area}) - {h.address}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Doctor Select */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Stethoscope size={18} color="#0284c7" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>2. 담당 전문의 선택</h3>
            </div>
            {hospitalDoctors.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>선택하신 병원에 등록된 전문의가 없습니다.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {hospitalDoctors.map(doc => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        background: isSelected ? '#e0f2fe' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <img src={doc.image} alt={doc.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? '#0369a1' : '#0f172a' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{doc.departmentName} • 경력 {doc.experience}년</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Date Calendar */}
          <AppointmentCalendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Step 4: Time Slot Grid */}
          <TimeSlotGrid
            slots={slotsForDate}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
          />

          {/* Step 5: Patient Info */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <User size={18} color="#0284c7" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>3. 예약자 및 환자 정보</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>성함</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>연락처</label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>주요 증상 및 진료 메모 (선택)</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="현재 겪고 계신 증상이나 요청사항을 간단히 기재해 주세요."
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Right Sticky Summary & Submit */}
        <div>
          <div style={{ position: 'sticky', top: '96px' }}>
            <AppointmentSummary
              hospital={selectedHospital}
              doctor={selectedDoctor}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              patientInfo={{ name: patientName, phone: patientPhone }}
            />

            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              style={{
                width: '100%',
                padding: '16px',
                background: (!selectedDate || !selectedTime) ? '#94a3b8' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '1.05rem',
                cursor: (!selectedDate || !selectedTime || loading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Calendar size={20} />
              <span>{loading ? '예약 처리 중...' : '진료 예약 신청 완료하기'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
