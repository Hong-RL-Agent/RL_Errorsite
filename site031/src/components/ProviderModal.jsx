import React, { useState } from "react";
import TimeSlotPicker from "./TimeSlotPicker.jsx";

const tabs = ["소개", "서비스", "후기", "위치"];

export default function ProviderModal({ provider, onClose, onPreparing }) {
  const [activeTab, setActiveTab] = useState("소개");
  if (!provider) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="provider-modal" role="dialog" aria-modal="true" aria-label={`${provider.name} 상세`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>닫기</button>
        <img src={provider.image} alt={`${provider.name} 이미지`} />
        <div className="modal-content">
          <span className="service-badge">{provider.serviceType}</span>
          <h2>{provider.name}</h2>
          <p>{provider.description}</p>
          <div className="modal-tabs" data-bug-id="site031-bug03">
            {tabs.map((tab) => (
              <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <div className="tab-panel">
            <strong>{activeTab}</strong>
            <p>{provider.region}에서 {provider.petTypes.join(", ")} 케어를 제공합니다. 평점 {provider.rating}, 가격대 {provider.priceRange}</p>
          </div>
          <TimeSlotPicker provider={provider} />
          <button className="modal-reserve" onClick={onPreparing}>이 시간으로 예약 요청</button>
        </div>
      </section>
    </div>
  );
}
