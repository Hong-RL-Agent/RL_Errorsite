import React from "react";
import PlayerCard from "./PlayerCard.jsx";

export default function PlayerGrid({ players, followed, onToggleFollow, onOpenPlayer }) {
  return (
    <section className="player-section">
      <div className="section-heading"><span>Player cards</span><h2>플레이어 카드</h2></div>
      <div className="player-grid">
        {players.slice(0, 6).map((player) => <PlayerCard key={player.player} player={player} followed={followed.includes(player.player)} onToggleFollow={onToggleFollow} onOpenPlayer={onOpenPlayer} />)}
      </div>
    </section>
  );
}
