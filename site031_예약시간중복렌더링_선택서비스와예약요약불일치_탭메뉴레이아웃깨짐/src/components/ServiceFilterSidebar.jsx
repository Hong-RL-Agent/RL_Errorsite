import React from "react";

export default function ServiceFilterSidebar({ services, selectedService, onServiceSelect, petTypes, petType, onPetTypeChange, pets }) {
  return (
    <aside className="filter-sidebar">
      <h2>서비스 필터</h2>
      <div className="filter-group">
        {services.map((service) => (
          <button key={service} className={selectedService === service ? "active" : ""} onClick={() => onServiceSelect(service)}>
            {service}
          </button>
        ))}
      </div>
      <label className="pet-type-filter">
        <span>반려동물 종류</span>
        <select value={petType} onChange={(event) => onPetTypeChange(event.target.value)}>
          {petTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>
      <div className="pet-list">
        <h3>등록된 반려동물</h3>
        {pets.map((pet) => (
          <article key={pet.name}>
            <strong>{pet.name}</strong>
            <span>{pet.type} · {pet.age}살</span>
            <p>{pet.note}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}
