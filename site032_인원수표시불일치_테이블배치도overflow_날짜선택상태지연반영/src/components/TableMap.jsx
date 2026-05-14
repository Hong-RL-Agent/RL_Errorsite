import React from "react";

export default function TableMap({ tables }) {
  return (
    <section className="table-section">
      <div className="section-heading"><span>Dining room</span><h2>좌석 배치 mock</h2></div>
      <div className="table-map" data-bug-id="site032-bug02">
        {tables.map((table) => (
          <button key={table.tableNo} className={table.available ? "available" : "reserved"}>
            <strong>{table.tableNo}</strong>
            <span>{table.seats}석</span>
            <small>{table.position}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
