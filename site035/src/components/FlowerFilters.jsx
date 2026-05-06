import React from "react";

export default function FlowerFilters({ purposes, purpose, onPurposeChange, priceBands, priceBand, onPriceBandChange }) {
  return (
    <section className="filter-panel">
      <div className="chip-row">{purposes.map((item) => <button key={item} className={purpose === item ? "active" : ""} onClick={() => onPurposeChange(item)}>{item}</button>)}</div>
      <label><span>가격대</span><select value={priceBand} onChange={(event) => onPriceBandChange(event.target.value)}>{priceBands.map((item) => <option key={item}>{item}</option>)}</select></label>
    </section>
  );
}
