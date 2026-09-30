import React from 'react';
import { Bookmark, ShieldCheck, MapPin, Gauge, Fuel } from 'lucide-react';
import InspectionBadge from './InspectionBadge';

export default function VehicleCard({ vehicle, isFavorite, onToggleFavorite, onSelectVehicle, onBookInspection }) {
  return (
    <div className="vehicle-card">
      <div className="vehicle-image-wrapper">
        <img
          src={vehicle.image}
          alt={vehicle.model}
          className="vehicle-image"
          loading="lazy"
        />
        <div className="vehicle-grade-pill">
          <ShieldCheck size={14} color="#60a5fa" />
          <span>점검 {vehicle.inspectionGrade}</span>
        </div>
        <button
          className="vehicle-fav-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(vehicle.id);
          }}
          title="관심 차량 추가"
        >
          <Bookmark
            size={18}
            fill={isFavorite ? '#ea580c' : 'none'}
            color={isFavorite ? '#ea580c' : '#64748b'}
          />
        </button>
      </div>

      <div className="vehicle-card-body">
        <div className="vehicle-brand">{vehicle.brand}</div>
        <h3
          className="vehicle-title"
          onClick={() => onSelectVehicle(vehicle.id)}
          style={{ cursor: 'pointer' }}
        >
          {vehicle.model}
        </h3>

        <div className="vehicle-specs">
          <span>{vehicle.year}년식</span>
          <span className="spec-dot">•</span>
          <span>{vehicle.mileage.toLocaleString()}km</span>
          <span className="spec-dot">•</span>
          <span>{vehicle.fuel}</span>
          <span className="spec-dot">•</span>
          <span>{vehicle.region}</span>
        </div>

        <div style={{ marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <InspectionBadge grade={vehicle.inspectionGrade} score={vehicle.inspectionScore} size="sm" />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {vehicle.accidentHistory}
          </span>
        </div>

        <div className="vehicle-footer">
          <div className="vehicle-price">
            {vehicle.price.toLocaleString()}<span>만원</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn-detail"
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              상세보기
            </button>
            <button
              className="btn-detail"
              style={{ background: '#1e40af', color: '#ffffff', borderColor: '#1e40af' }}
              onClick={() => onBookInspection(vehicle.id)}
            >
              점검예약
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
