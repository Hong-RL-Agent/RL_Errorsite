import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import EsportsHero from "./components/EsportsHero.jsx";
import GameSelector from "./components/GameSelector.jsx";
import RankingTable from "./components/RankingTable.jsx";
import PlayerGrid from "./components/PlayerGrid.jsx";
import PlayerModal from "./components/PlayerModal.jsx";
import MatchList from "./components/MatchList.jsx";
import FollowPanel from "./components/FollowPanel.jsx";
import SeasonRewards from "./components/SeasonRewards.jsx";
import Footer from "./components/Footer.jsx";

const games = ["Valorant", "League Arena", "Overwatch Nexus"];
const seasons = ["2026 Spring", "2026 Preseason", "2025 Finals"];

export default function App() {
  const [rankings, setRankings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [game, setGame] = useState(games[0]);
  const [season, setSeason] = useState(seasons[0]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("rank");
  const [modalPlayer, setModalPlayer] = useState(null);
  const [followed, setFollowed] = useState(["Vanta"]);

  async function loadRankings() {
    const [rankingResponse, matchResponse] = await Promise.all([
      fetch("/api/rankings"),
      fetch("/api/matches")
    ]);
    if (!rankingResponse.ok || !matchResponse.ok) throw new Error("e스포츠 데이터를 불러오지 못했습니다.");
    const rankingData = await rankingResponse.json();
    const matchData = await matchResponse.json();
    setRankings(rankingData.rankings);
    setMatches(matchData.matches);
  }

  useEffect(() => {
    let mounted = true;
    loadRankings()
      .catch((loadError) => mounted && setError(loadError.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const visibleRankings = useMemo(() => {
    const filtered = rankings.filter((row) => row.player.toLowerCase().includes(query.toLowerCase()) || row.team.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => {
      if (sortKey === "score") return b.score - a.score;
      if (sortKey === "winRate") return b.winRate - a.winRate;
      return a.rank - b.rank;
    });
  }, [rankings, query, sortKey]);

  function toggleFollow(player) {
    setFollowed((current) => current.includes(player) ? current.filter((name) => name !== player) : [...current, player]);
  }

  function showPreparing() {
    alert("준비중입니다.");
  }

  return (
    <div className="app-shell">
      <Header game={game} games={games} onGameChange={setGame} season={season} seasons={seasons} onSeasonChange={setSeason} query={query} onQueryChange={setQuery} onPreparing={showPreparing} />
      <main>
        {loading && <div className="status-panel">랭킹 데이터를 불러오는 중입니다...</div>}
        {error && <div className="status-panel error">오류: {error}</div>}
        {!loading && !error && (
          <>
            <EsportsHero topPlayer={rankings[0]} game={game} season={season} />
            <GameSelector game={game} games={games} onGameChange={setGame} season={season} seasons={seasons} onSeasonChange={setSeason} />
            <section className="dashboard-layout">
              <div className="dashboard-main">
                <div className="ranking-toolbar">
                  <div>
                    <span>Live ladder</span>
                    <h2>시즌 랭킹 테이블</h2>
                  </div>
                  {/* INTENTIONAL GUI BUG: site033-bug03 */}
                  {/* Type: refresh-button-no-response */}
                  {/* Description: 랭킹 새로고침 버튼에 실제 fetch handler를 연결하지 않아 클릭해도 데이터가 갱신되지 않음. */}
                  <button data-bug-id="site033-bug03" onClick={() => {}}>랭킹 새로고침</button>
                </div>
                <RankingTable rankings={visibleRankings} sortKey={sortKey} onSortChange={setSortKey} onOpenPlayer={setModalPlayer} />
                <PlayerGrid players={visibleRankings} followed={followed} onToggleFollow={toggleFollow} onOpenPlayer={setModalPlayer} />
                <MatchList matches={matches} />
                <SeasonRewards />
              </div>
              <FollowPanel players={rankings.filter((row) => followed.includes(row.player))} onToggleFollow={toggleFollow} />
            </section>
          </>
        )}
      </main>
      <PlayerModal player={modalPlayer} onClose={() => setModalPlayer(null)} onToggleFollow={toggleFollow} followed={followed.includes(modalPlayer?.player)} />
      <Footer onPreparing={showPreparing} />
    </div>
  );
}
