import React from "react";

export default function ProviderCard({ provider, selected, onSelectProvider, onOpenModal }) {
  return (
    <article className={`provider-card ${selected ? "selected" : ""}`} onClick={() => onSelectProvider(provider)}>
      <img src={provider.image} alt={`${provider.name} 대표 이미지`} />
      <div className="provider-card-body">
        <div className="provider-topline">
          <span>{provider.serviceType}</span>
          <strong>★ {provider.rating}</strong>
        </div>
        <h3>{provider.name}</h3>
        <p>{provider.region} · {provider.distanceKm}km</p>
        <div className="time-preview">{provider.availableTimes.slice(0, 3).join(" · ")}</div>
        <div className="provider-meta">
          <span>{provider.priceRange}</span>
          <span>{provider.petTypes.join(", ")}</span>
        </div>
        <div className="card-actions">
          <button onClick={(event) => { event.stopPropagation(); onOpenModal(provider); }}>상세 보기</button>
          <button onClick={(event) => { event.stopPropagation(); onSelectProvider(provider); }}>예약 선택</button>
        </div>
      </div>
    </article>
  );
}
