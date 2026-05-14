import React from "react";

export default function GenreFilters({ genres, activeGenre, onGenreChange }) {
  return (
    <section className="filter-section" aria-label="공연 장르 필터">
      {genres.map((item) => (
        <button
          key={item}
          className={item === activeGenre ? "active" : ""}
          onClick={() => onGenreChange(item)}
        >
          {item === "All" ? "전체 장르" : item}
        </button>
      ))}
    </section>
  );
}
