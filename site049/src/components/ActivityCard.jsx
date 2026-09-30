import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function ActivityCard({ activity, onClick }) {
  const percent = Math.min(100, Math.round((activity.enrolled / activity.capacity) * 100));
  const isClosed = activity.status === 'closed' || activity.enrolled >= activity.capacity;

  return (
    <div className="activity-card" onClick={onClick}>
      <div className="activity-card-thumb-wrap">
        <img 
          src={activity.image} 
          alt={activity.title} 
          className="activity-card-thumb" 
          loading="lazy" 
        />
        <span className={`card-category-badge ${activity.category}`}>
          {activity.category}
        </span>
        <span className={`card-status-badge ${isClosed ? 'closed' : 'open'}`}>
          {isClosed ? '마감' : '모집중'}
        </span>
      </div>

      <div className="activity-card-body">
        <h3 className="activity-card-title">{activity.title}</h3>

        <div className="activity-card-meta">
          <div className="meta-item">
            <Calendar size={15} color="var(--primary)" />
            <span>{activity.date}</span>
          </div>
          <div className="meta-item">
            <Clock size={15} color="var(--primary)" />
            <span>{activity.startTime} ~ {activity.endTime}</span>
          </div>
          <div className="meta-item">
            <MapPin size={15} color="var(--primary)" />
            <span>{activity.location}</span>
          </div>
        </div>

        <div className="activity-card-footer">
          <div className="capacity-progress-group">
            <Users size={15} color="var(--text-muted)" />
            <span className="capacity-count">
              {activity.enrolled}/{activity.capacity}명
            </span>
            <div className="capacity-bar-bg">
              <div className="capacity-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
            상세보기 &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
