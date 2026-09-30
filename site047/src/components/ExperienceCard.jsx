import React, { useState } from 'react';
import { Star, MapPin, Clock, Heart } from 'lucide-react';
import { fetchApi } from '../api/client';

export default function ExperienceCard({ experience, onSelect, onWishlistToggle, isWishlisted = false }) {
  const [wished, setWished] = useState(isWishlisted);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    const nextState = !wished;
    setWished(nextState);

    if (nextState) {
      fetchApi('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ experienceId: experience.id })
      }).catch(() => {});
    } else {
      fetchApi(`/api/wishlist/${experience.id}`, {
        method: 'DELETE'
      }).catch(() => {});
    }

    if (onWishlistToggle) {
      onWishlistToggle(experience.id, nextState);
    }
  };

  const categoryLabels = {
    tour: '로컬 투어',
    class: '원데이 클래스',
    activity: '액티비티/레저'
  };

  return (
    <div 
      className="card experience-card"
      id={`experience-card-${experience.id}`}
      onClick={() => onSelect && onSelect(experience.id)}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '65%', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
        <img 
          src={experience.image} 
          alt={experience.title}
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
          <span className="badge badge-blue" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(2, 132, 199, 0.9)', color: '#fff' }}>
            {categoryLabels[experience.category] || experience.category}
          </span>
          <span className="badge badge-gray" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#fff' }}>
            <MapPin size={11} /> {experience.region}
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          id={`btn-wishlist-${experience.id}`}
          onClick={handleHeartClick}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s ease'
          }}
          title="위시리스트 저장"
        >
          <Heart size={18} color={wished ? '#ef4444' : '#64748b'} fill={wished ? '#ef4444' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Rating and Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={15} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{experience.rating}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({experience.reviewCount})</span>
            </div>
            {experience.duration && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                <Clock size={13} /> {experience.duration}
              </div>
            )}
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
            {experience.title}
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
            {experience.description}
          </p>
        </div>

        {/* Price & Host */}
        <div style={{
          paddingTop: 12,
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img 
              src={experience.hostAvatar} 
              alt={experience.hostName} 
              style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{experience.hostName}</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-navy)' }}>
              {Number(experience.price).toLocaleString()}원
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-light)', marginLeft: 2 }}>/ 1인</span>
          </div>
        </div>
      </div>
    </div>
  );
}
