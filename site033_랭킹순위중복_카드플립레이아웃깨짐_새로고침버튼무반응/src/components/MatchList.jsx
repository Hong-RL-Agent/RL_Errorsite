import React from "react";

export default function MatchList({ matches }) {
  return (
    <section className="match-section">
      <div className="section-heading"><span>Recent matches</span><h2>최근 경기</h2></div>
      <div className="match-list">{matches.map((match) => <article key={match.id}><strong>{match.teams}</strong><span>{match.result}</span><p>{match.map} · {match.time}</p></article>)}</div>
    </section>
  );
}
