import React from "react";

export default function PlayerModal({ player, onClose, onToggleFollow, followed }) {
  if (!player) return null;
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="player-modal" role="dialog" aria-modal="true" aria-label={`${player.player} 상세`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>닫기</button>
        <span>{player.tier}</span><h2>{player.player}</h2><p>{player.team}</p>
        <dl><div><dt>점수</dt><dd>{player.score}</dd></div><div><dt>승률</dt><dd>{player.winRate}%</dd></div><div><dt>최근 전적</dt><dd>{player.recent}</dd></div></dl>
        <button onClick={() => onToggleFollow(player.player)}>{followed ? "팔로우 해제" : "팔로우"}</button>
      </section>
    </div>
  );
}
