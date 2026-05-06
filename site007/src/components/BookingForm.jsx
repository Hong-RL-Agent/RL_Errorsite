import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';

export default function BookingForm({ selectedDoctor }) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    fetch('/api/slots')
      .then(res => res.json())
      .then(data => setTimeSlots(data.data));
  }, []);

  if (!selectedDoctor) {
    return (
      <div className="booking-panel" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <User size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
        <p>예약하실 의료진을 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="booking-panel">
      <div className="panel-title">예약 정보 입력</div>
      
      <div>
        <div style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} />
          방문 시간 선택
        </div>
        <div className="time-grid">
          {timeSlots.map(time => (
            <button 
              key={time}
              className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div className="patient-form">
        <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} />
          환자 정보
        </div>
        
        {/* INTENTIONAL GUI BUG: site007-bug03 타겟 (CSS에서 height:40px로 겹침 유발) */}
        <div className="form-group" data-bug-id="site007-bug03">
          <label>환자 성함</label>
          <input type="text" placeholder="이름을 입력하세요" />
        </div>
        
        <div className="form-group" style={{ height: 'auto' }}>
          <label>연락처</label>
          <input type="tel" placeholder="010-0000-0000" />
        </div>
        
        <div className="form-group" style={{ height: 'auto' }}>
          <label>증상 메모</label>
          <input type="text" placeholder="간단한 증상을 적어주세요" />
        </div>
      </div>

      {/* INTENTIONAL GUI BUG: site007-bug01
         Type: button-no-response
         Description: “예약 확정” 버튼이 클릭되어도 확인 메시지가 뜨지 않는다.
         Explanation: onClick 이벤트에 alert나 상태 변화 없이 아무 동작을 안함. */}
      <button 
        className="btn-confirm" 
        data-bug-id="site007-bug01"
        disabled={!selectedTime}
        onClick={() => {}} 
      >
        예약 확정
      </button>
    </div>
  );
}
