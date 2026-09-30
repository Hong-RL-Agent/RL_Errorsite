import React from 'react';
import { MapPin, Calendar, Users, Clock, ArrowRight } from 'lucide-react';

export default function ClassCard({ cls, onSelect }) {
  const isFull = cls.enrolled >= cls.capacity;

  return (
    <div 
      className="card"
      id={`class-card-${cls.id}`}
      onClick={() => onSelect && onSelect(cls.id)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Image Banner */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '60%', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
        <img 
          src={cls.image} 
          alt={cls.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          loading="lazy"
        />

        {/* Category & Region Badge */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span className="badge badge-blue" style={{ backgroundColor: 'rgba(37, 99, 235, 0.9)', color: '#fff' }}>
            {cls.category}
          </span>
          <span className="badge badge-gray" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#fff' }}>
            <MapPin size={11} /> {cls.region}
          </span>
        </div>

        {isFull && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700
          }}>
            마감
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Date & Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} color="var(--soft-blue)" /> {cls.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} color="var(--soft-blue)" /> {cls.time}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--primary-navy)',
            lineHeight: 1.4,
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {cls.title}
          </h3>

          <p style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {cls.description}
          </p>
        </div>

        {/* Footer info: Instructor & Enrolled Capacity */}
        <div style={{
          paddingTop: 12,
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img 
              src={cls.instructorAvatar} 
              alt={cls.instructorName} 
              style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{cls.instructorName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: isFull ? 'var(--danger)' : 'var(--soft-blue)' }}>
            <Users size={13} />
            <span>{cls.enrolled}/{cls.capacity}명</span>
          </div>
        </div>
      </div>
    </div>
  );
}
