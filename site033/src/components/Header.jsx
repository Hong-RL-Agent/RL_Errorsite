import React from "react";

export default function Header({ game, games, onGameChange, season, seasons, onSeasonChange, query, onQueryChange, onPreparing }) {
  return (
    <header className="site-header">
      <a className="logo" href="#top">NexusRank</a>
      <label><span>게임</span><select value={game} onChange={(event) => onGameChange(event.target.value)}>{games.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>시즌</span><select value={season} onChange={(event) => onSeasonChange(event.target.value)}>{seasons.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="player-search"><span>플레이어 검색</span><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="선수명 또는 팀 검색" /></label>
      <button onClick={onPreparing}>로그인</button>
    </header>
  );
}
