import React from "react";
import ProviderCard from "./ProviderCard.jsx";

export default function ProviderGrid({ providers, selectedProviderId, selectedService, onSelectProvider, onOpenModal }) {
  return (
    <section className="provider-section" id="providers">
      <div className="section-heading">
        <span>Selected service: {selectedService}</span>
        <h2>예약 가능한 케어 업체</h2>
      </div>
      <div className="provider-grid">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            selected={provider.id === selectedProviderId}
            onSelectProvider={onSelectProvider}
            onOpenModal={onOpenModal}
          />
        ))}
      </div>
      {providers.length === 0 && <div className="empty-state">조건에 맞는 업체가 없습니다.</div>}
    </section>
  );
}
