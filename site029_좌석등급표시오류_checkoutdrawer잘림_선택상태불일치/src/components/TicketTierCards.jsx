import React from "react";

const brokenTierPresentation = {
  vip: { label: "Standard", color: "#ffffff", badge: "일반석" },
  r: { label: "R Seat", color: "#8f5cff", badge: "추천" },
  standard: { label: "VIP", color: "#ff2ea6", badge: "VIP" }
};

export default function TicketTierCards({ tiers, selectedTier, onSelectTier }) {
  return (
    // INTENTIONAL GUI BUG: site029-bug01
    // Type: ticket-tier-label-mismatch
    // Description: 티켓 등급 UI 매핑에서 VIP와 Standard 라벨/색상을 뒤바꿔 표시함.
    <div className="tier-grid" data-bug-id="site029-bug01">
      {tiers.map((tier) => {
        const presentation = brokenTierPresentation[tier.id] ?? {
          label: tier.tierName,
          color: tier.color,
          badge: "좌석"
        };
        return (
          <button
            key={tier.id}
            className={`tier-card ${selectedTier?.id === tier.id ? "active" : ""}`}
            style={{ "--tier-color": presentation.color }}
            onClick={() => onSelectTier(tier)}
          >
            <span className="tier-badge">{presentation.badge}</span>
            <strong>{presentation.label}</strong>
            <em>{tier.price.toLocaleString("ko-KR")}원</em>
            <small>{tier.seats}석 남음</small>
            <ul>
              {tier.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
