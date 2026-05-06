import React from "react";

export default function RankingTable({ rankings, sortKey, onSortChange, onOpenPlayer }) {
  return (
    <section className="ranking-section">
      <div className="sort-row">
        <button className={sortKey === "rank" ? "active" : ""} onClick={() => onSortChange("rank")}>순위순</button>
        <button className={sortKey === "score" ? "active" : ""} onClick={() => onSortChange("score")}>점수순</button>
        <button className={sortKey === "winRate" ? "active" : ""} onClick={() => onSortChange("winRate")}>승률순</button>
      </div>
      <table>
        <thead><tr><th>순위</th><th>플레이어</th><th>팀</th><th>점수</th><th>승률</th><th>최근 전적</th><th>티어</th></tr></thead>
        <tbody data-bug-id="site033-bug01">
          {rankings.map((row, index) => {
            // INTENTIONAL GUI BUG: site033-bug01
            // Type: duplicate-ranking-position
            // Description: 특정 row의 표시 순위를 이전 row 순위로 렌더링하여 서로 다른 플레이어가 같은 순위로 보임.
            const displayRank = index === 2 ? rankings[index - 1]?.rank : row.rank;
            return (
              <tr key={row.player} onClick={() => onOpenPlayer(row)}>
                <td>#{displayRank}</td><td>{row.player}</td><td>{row.team}</td><td>{row.score}</td><td>{row.winRate}%</td><td>{row.recent}</td><td>{row.tier}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
