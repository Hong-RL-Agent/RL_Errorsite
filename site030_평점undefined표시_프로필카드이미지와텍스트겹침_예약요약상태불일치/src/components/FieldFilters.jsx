import React from "react";

export default function FieldFilters({ fields, activeField, onFieldChange, careerFilters, activeCareer, onCareerChange }) {
  return (
    <section className="filter-area">
      <div>
        <h2>멘토 찾기</h2>
        <div className="chip-row">
          {fields.map((item) => (
            <button key={item} className={activeField === item ? "active" : ""} onClick={() => onFieldChange(item)}>
              {item === "All" ? "전체 분야" : item}
            </button>
          ))}
        </div>
      </div>
      <label className="career-filter">
        <span>경력 필터</span>
        <select value={activeCareer} onChange={(event) => onCareerChange(event.target.value)}>
          {careerFilters.map((item) => (
            <option key={item} value={item}>{item === "All" ? "전체 경력" : item}</option>
          ))}
        </select>
      </label>
    </section>
  );
}
