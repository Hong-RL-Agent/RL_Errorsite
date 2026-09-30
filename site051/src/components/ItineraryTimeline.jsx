import React from 'react';
import { MapPin, Clock, FileText } from 'lucide-react';

export default function ItineraryTimeline({ itinerary = [] }) {
  if (!itinerary || itinerary.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', background: 'var(--sand)', borderRadius: 'var(--radius-lg)' }}>
        등록된 세부 일정이 없습니다.
      </div>
    );
  }

  // Group by day
  const days = {};
  itinerary.forEach(item => {
    const d = item.day || 1;
    if (!days[d]) days[d] = [];
    days[d].push(item);
  });

  return (
    <div>
      {Object.entries(days).map(([dayNum, items]) => (
        <div key={dayNum} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ 
              background: 'var(--primary)', 
              color: '#fff', 
              fontSize: '0.88rem', 
              fontWeight: '800', 
              padding: '4px 12px', 
              borderRadius: 'var(--radius-full)' 
            }}>
              Day {dayNum}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '600' }}>
              {items.length}개 장소 방문
            </span>
          </div>

          <div className="timeline-list">
            {items.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div className="timeline-place">{item.place}</div>
                    {item.time && (
                      <span className="timeline-time">
                        <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        {item.time}
                      </span>
                    )}
                  </div>
                  {item.note && <div className="timeline-note">{item.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
