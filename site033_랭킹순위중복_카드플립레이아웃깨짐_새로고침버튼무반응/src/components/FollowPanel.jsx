import React from "react";

export default function FollowPanel({ players, onToggleFollow }) {
  return (
    <aside className="follow-panel">
      <span>Following</span>
      <h2>내가 팔로우한 선수</h2>
      {players.length === 0 && <p>팔로우한 선수가 없습니다.</p>}
      {players.map((player) => <article key={player.player}><strong>{player.player}</strong><span>{player.team}</span><button onClick={() => onToggleFollow(player.player)}>해제</button></article>)}
    </aside>
  );
}
