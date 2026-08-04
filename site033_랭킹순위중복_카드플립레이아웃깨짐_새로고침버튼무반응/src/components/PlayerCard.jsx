import React, { useState } from "react";

export default function PlayerCard({ player, followed, onToggleFollow, onOpenPlayer }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <article className={`player-card ${flipped ? "flipped" : ""}`} data-bug-id="site033-bug02">
      <div className="player-card-inner">
        <div className="player-face front">
          <span>{player.tier}</span>
          <h3>{player.player}</h3>
          <p>{player.team}</p>
          <strong>{player.score} pts</strong>
          <div><button onClick={() => setFlipped(true)}>통계 보기</button><button onClick={() => onOpenPlayer(player)}>상세</button></div>
        </div>
        <div className="player-face back">
          <strong>Win rate {player.winRate}%</strong>
          <p>{player.recent}</p>
          <button onClick={() => onToggleFollow(player.player)}>{followed ? "팔로우 해제" : "팔로우"}</button>
          <button onClick={() => setFlipped(false)}>돌아가기</button>
        </div>
      </div>
    </article>
  );
}
