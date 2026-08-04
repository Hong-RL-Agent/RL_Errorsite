import React from 'react';
import { Plane, Hotel, MapPin } from 'lucide-react';

export default function TripTimeline({ trips, onTripClick }) {
  if (trips.length === 0) return <p>등록된 일정이 없습니다.</p>;

  return (
    <div className="timeline-section">
      <h2 style={{marginBottom: '1.5rem'}}>내 일정 타임라인</h2>
      <div className="timeline">
        {trips.map((trip) => {
          let StatusIcon = MapPin;
          
          // Map status to classes for bug02
          let statusClass = '';
          if (trip.status === '확정') statusClass = 'status-confirmed';
          if (trip.status === '대기') statusClass = 'status-pending';
          if (trip.status === '변경됨') statusClass = 'status-changed';

          return (
            <div key={trip.id} className="timeline-item">
              <div className="timeline-date">
                <div>{trip.startDate}</div>
                <div style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>~ {trip.endDate}</div>
              </div>
              
              <div className="timeline-content">
                <div className="timeline-card" onClick={() => onTripClick(trip)} style={{cursor: 'pointer'}}>
                  <div className="flex items-center gap-4">
                    {/* INTENTIONAL GUI BUG: site018-bug03
                        Type: color-only-status-indicator
                        Description: 일정 충돌 상태를 색상 점으로만 표시하고 텍스트 라벨을 제공하지 않음. */}
                    <div 
                      data-bug-id="site018-bug03" 
                      className={`conflict-${trip.conflict}`}
                      title="충돌 상태 인디케이터"
                    ></div>
                    
                    <div>
                      <h3 style={{fontSize: '1.25rem', marginBottom: '0.25rem'}}>{trip.city} 여행</h3>
                      <div className="flex gap-4 text-muted" style={{fontSize: '0.875rem'}}>
                        <span className="flex items-center gap-2"><Hotel size={14}/> {trip.accommodation}</span>
                        <span className="flex items-center gap-2"><Plane size={14}/> {trip.flight}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span data-bug-id="site018-bug02" className="status-badge-container">
                      <span className={`status-badge ${statusClass}`}>
                        {trip.status}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
