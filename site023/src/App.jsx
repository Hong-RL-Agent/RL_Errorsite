import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  GitBranch, 
  Sword, 
  Activity, 
  ShieldAlert, 
  ExternalLink, 
  Search, 
  Filter,
  Terminal,
  Settings,
  ChevronRight,
  Info,
  X,
  Globe,
  LayoutDashboard
} from 'lucide-react';

const API_BASE = '/api';

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="btn-close" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="modal-body">
        {children}
      </div>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [brackets, setBrackets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [lastBugId, setLastBugId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState('alpha');
  
  // New States for Functionality
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
    fetchMatches();
    fetchBrackets();
  }, [selectedLeague]);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const fetchTournaments = async () => {
    try {
      const res = await fetch(`${API_BASE}/tournaments?leagueId=${selectedLeague}`);
      const data = await res.json();
      if (data.bugId) setLastBugId(data.bugId);
      setTournaments(data.data || []);
      addLog(`Tournaments synced for league: ${selectedLeague}`);
    } catch (e) { addLog('Failed to sync tournaments'); }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams`);
      const data = await res.json();
      if (data.bugId) setLastBugId(data.bugId);
      setTeams(data.data || []);
      addLog('Team registry updated.');
    } catch (e) { addLog('Failed to sync teams'); }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_BASE}/matches`);
      const data = await res.json();
      setMatches(data.data || []);
      addLog('Match schedules updated.');
    } catch (e) { addLog('Failed to sync matches'); }
  };

  const fetchBrackets = async () => {
    try {
      const res = await fetch(`${API_BASE}/brackets`);
      const data = await res.json();
      if (data.bugId) setLastBugId(data.bugId);
      setBrackets(data.data || []);
      addLog('Bracket layout generated.');
    } catch (e) { addLog('Failed to sync brackets'); }
  };

  const fetchMatchDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/matches/${id}`);
      const data = await res.json();
      if (data.bugId) setLastBugId(data.bugId);
      alert(`[MATCH DETAIL]\nID: ${data.data.id}\nTeams: ${data.data.teamA} vs ${data.data.teamB}\nStatus: ${data.data.status}\n\nRelated Data Leak Detected: ${data.relatedMatches?.length} items.`);
    } catch (e) { alert('Failed to fetch details'); }
  };

  const viewRoster = async (teamId) => {
    try {
      const res = await fetch(`${API_BASE}/teams/${teamId}`);
      const data = await res.json();
      setSelectedTeam(data.data);
    } catch (e) { addLog('Failed to load roster'); }
  };

  const openDashboard = (t) => {
    setSelectedTournament(t);
  };

  const renderTournaments = () => (
    <div className="tournament-grid animate-view">
      {tournaments.map(t => (
        <div key={t.id} className="card" onClick={() => fetchTournaments()} data-bug-id="site023-bug01">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700 }}>{t.leagueId.toUpperCase()}</span>
            <Trophy size={18} color="var(--accent-purple)" />
          </div>
          <h3>{t.name}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Prize Pool: <span style={{ color: 'var(--accent-green)' }}>{t.prize}</span></p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); openDashboard(t); }}>
              DASHBOARD
            </button>
            <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={(e) => { e.stopPropagation(); alert(`Opening external coverage for ${t.name}...`); }}>
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTeams = () => (
    <div className="animate-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Certified Teams</h2>
        <button className="btn btn-outline" onClick={() => fetchTeams()} data-bug-id="site023-bug02">
          <Terminal size={16} /> REFRESH REGISTRY
        </button>
      </div>
      <table className="teams-table">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Region</th>
            <th>League Affinity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td style={{ fontWeight: 800 }}>{team.name}</td>
              <td>{team.region}</td>
              <td><span style={{ color: team.leagueId === 'alpha' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>{team.leagueId.toUpperCase()}</span></td>
              <td><button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }} onClick={() => viewRoster(team.id)}>VIEW ROSTER</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBrackets = () => (
    <div className="animate-view">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <h2>Dynamic Brackets</h2>
        <button className="btn btn-outline" onClick={() => fetchBrackets()} data-bug-id="site023-bug04">
          <GitBranch size={16} /> RE-GENERATE VIEW
        </button>
      </div>
      <div className="bracket-container">
        {brackets.map((round, idx) => (
          <div key={idx} className="round-column">
            <div className="round-title">{round.name}</div>
            {[...Array(round.matches)].map((_, i) => (
              <div key={i} className="match-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                  <span>MATCH #{100 + i}</span>
                  <span>LIVE</span>
                </div>
                <div style={{ fontWeight: 700 }}>TEAM A</div>
                <div style={{ fontWeight: 700 }}>TEAM B</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMatches = () => (
    <div className="tournament-grid animate-view">
      {matches.map(m => (
        <div key={m.id} className="card" onClick={() => fetchMatchDetail(m.id)} data-bug-id="site023-bug03">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Sword size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)' }}>{m.round}</span>
          </div>
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{m.teamA}</p>
            <p style={{ color: 'var(--accent-purple)', fontWeight: 900, fontSize: '1.5rem', margin: '0.5rem 0' }}>{m.score}</p>
            <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{m.teamB}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status: <span style={{ color: m.status === 'finished' ? 'var(--accent-green)' : 'var(--accent-cyan)' }}>{m.status.toUpperCase()}</span></span>
            <span style={{ fontWeight: 700 }}>{m.tournamentId}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-wrapper">
      <aside className="sidebar">
        <div className="logo">
          <Activity size={32} />
          <span>NEXUS</span>
        </div>
        <nav style={{ flex: 1 }}>
          <div className={`nav-link ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>
            <Trophy size={20} /> Tournaments
          </div>
          <div className={`nav-link ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>
            <Users size={20} /> Team Registry
          </div>
          <div className={`nav-link ${activeTab === 'brackets' ? 'active' : ''}`} onClick={() => setActiveTab('brackets')}>
            <GitBranch size={20} /> Brackets
          </div>
          <div className={`nav-link ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
            <Sword size={20} /> Results
          </div>
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>LEAGUE SELECTION</p>
          <select 
            value={selectedLeague} 
            onChange={(e) => setSelectedLeague(e.target.value)}
            style={{ width: '100%', background: '#000', border: '1px solid var(--accent-cyan)', color: '#fff', padding: '0.5rem', borderRadius: '5px' }}
          >
            <option value="alpha">Alpha Pro</option>
            <option value="beta">Beta Amateur</option>
            <option value="gamma">Gamma Global</option>
          </select>
        </div>
      </aside>

      <main className="main-view">
        <div className="view-header">
          <div className="view-title">
            <p style={{ color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.8rem' }}>ESPORTS MANAGEMENT CONSOLE</p>
            <h1>{activeTab.toUpperCase()}</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>SYSTEM: OPERATIONAL</span>
            </div>
            <button className="btn btn-outline" style={{ padding: '0.8rem' }} onClick={() => setShowSettings(true)}>
              <Settings size={20} />
            </button>
          </div>
        </div>

        {activeTab === 'tournaments' && renderTournaments()}
        {activeTab === 'teams' && renderTeams()}
        {activeTab === 'brackets' && renderBrackets()}
        {activeTab === 'matches' && renderMatches()}

        <div className="log-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem' }}>Kernel Streams</h4>
            {lastBugId && (
              <div className="bug-alert" style={{ margin: 0 }}>
                <ShieldAlert size={14} /> {lastBugId}
              </div>
            )}
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {logs.map((log, i) => (
              <div key={i} className="log-item">{log}</div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedTeam && (
        <Modal title={`${selectedTeam.name} Roster`} onClose={() => setSelectedTeam(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {selectedTeam.roster.map((player, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-cyan)' }}>
                <Users size={20} color="var(--accent-cyan)" />
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{player}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>PRIMARY PLAYER</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {selectedTournament && (
        <Modal title={`${selectedTournament.name} Dashboard`} onClose={() => setSelectedTournament(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <LayoutDashboard size={24} color="var(--accent-purple)" style={{ margin: '0 auto 0.5rem' }} />
              <h3>Total Matches</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>42</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <Globe size={24} color="var(--accent-green)" style={{ margin: '0 auto 0.5rem' }} />
              <h3>Viewers</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-green)' }}>1.2M</p>
            </div>
            <div className="card" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Info size={24} color="var(--accent-cyan)" />
              <div>
                <p style={{ fontWeight: 700 }}>Tournament Status</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Active Phase: Regional Qualifiers</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showSettings && (
        <Modal title="System Settings" onClose={() => setShowSettings(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700 }}>Telemetry Stream</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Enable real-time bug reporting</p>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700 }}>API Endpoint</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>v1.0.2-stable (Local)</p>
              </div>
              <button className="btn btn-outline" style={{ fontSize: '0.7rem' }}>UPDATE</button>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowSettings(false)}>SAVE CHANGES</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
