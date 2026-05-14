import React from "react";

export default function EsportsHero({ topPlayer, game, season }) {
  if (!topPlayer) return null;
  return (
    <section className="hero-section" id="top">
      <div className="top-rank-card">
        <span>Current #1</span>
        <h1>{topPlayer.player}</h1>
        <p>{topPlayer.team} · {topPlayer.tier}</p>
        <strong>{topPlayer.score.toLocaleString("ko-KR")} pts</strong>
      </div>
      <div className="tournament-banner">
        <span>{game} / {season}</span>
        <h2>Neon Masters Playoffs</h2>
        <p>상위 16명과 초청 팀이 겨루는 이번 시즌 최대 규모의 e스포츠 매치업.</p>
      </div>
    </section>
  );
}
