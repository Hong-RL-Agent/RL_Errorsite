import React from 'react';
import { X, Calendar, Plane, Hotel, MapPin } from 'lucide-react';

export default function TripModal({ trip, onClose }) {
  if (!trip) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center" style={{marginBottom: '1.5rem'}}>
          <h2 style={{fontSize: '1.5rem'}}>{trip.city} 여행 상세</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div className="flex items-center gap-4">
            <div style={{background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px'}}><Calendar size={20} className="text-muted" /></div>
            <div>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>여행 기간</p>
              <p style={{fontWeight: 500}}>{trip.startDate} ~ {trip.endDate}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div style={{background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px'}}><Plane size={20} className="text-muted" /></div>
            <div>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>항공편</p>
              <p style={{fontWeight: 500}}>{trip.flight}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div style={{background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px'}}><Hotel size={20} className="text-muted" /></div>
            <div>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>숙소</p>
              <p style={{fontWeight: 500}}>{trip.accommodation}</p>
            </div>
          </div>

          <div className="flex justify-between items-center" style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)'}}>
            <span style={{fontWeight: 600}}>현재 상태: {trip.status}</span>
            <button className="btn btn-outline" onClick={() => alert('준비중입니다.')}>일정 수정</button>
          </div>
        </div>
      </div>
    </div>
  );
}
