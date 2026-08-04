import React from "react";

export default function GameSelector({ game, games, onGameChange, season, seasons, onSeasonChange }) {
  return (
    <section className="selector-bar">
      <label><span>게임 선택</span><select value={game} onChange={(event) => onGameChange(event.target.value)}>{games.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>시즌 선택</span><select value={season} onChange={(event) => onSeasonChange(event.target.value)}>{seasons.map((item) => <option key={item}>{item}</option>)}</select></label>
    </section>
  );
}
