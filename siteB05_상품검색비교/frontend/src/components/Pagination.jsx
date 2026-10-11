import React from 'react';

export default function Pagination({ page, totalPages, nextPage, prevPage, onPage }) {
  const pages = totalPages ? Array.from({ length: totalPages }, (_, i) => i + 1) : [page];
  return (
    <nav className="pagination" aria-label="페이지 이동" data-bug-id="B05-ERR02">
      <button type="button" disabled={prevPage == null} onClick={() => onPage(prevPage)}>이전 페이지</button>
      {pages.map((n) => (
        <button type="button" key={n} className={n === page ? 'on' : ''} aria-current={n === page ? 'page' : undefined} onClick={() => onPage(n)}>{n}</button>
      ))}
      <button type="button" disabled={nextPage == null} onClick={() => onPage(nextPage)}>다음 페이지</button>
    </nav>
  );
}
