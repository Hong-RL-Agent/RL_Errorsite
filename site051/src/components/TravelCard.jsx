import React from 'react';
import { Calendar, MapPin, Heart, MessageSquare } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

export default function TravelCard({ travelLog, onClick }) {
  return (
    <div className="travel-card" onClick={onClick}>
      <div className="travel-card-thumb-wrap">
        <ImageWithFallback 
          src={travelLog.image} 
          alt={travelLog.title} 
          className="travel-card-thumb" 
        />
        <span className="card-dest-badge">
          {travelLog.destination}
        </span>
      </div>

      <div className="travel-card-body">
        <h3 className="travel-card-title">{travelLog.title}</h3>
        <p className="travel-card-desc">{travelLog.description}</p>

        <div className="travel-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src={travelLog.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
              alt={travelLog.authorName} 
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{travelLog.authorName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Heart size={14} color="#f43f5e" />
              <span>{travelLog.likes}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MessageSquare size={14} color="var(--primary)" />
              <span>{travelLog.commentCount}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
