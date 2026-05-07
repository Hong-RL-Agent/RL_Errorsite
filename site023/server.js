const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = 9132;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
const tournaments = [
  { id: 'T1', name: 'Alpha Pro League Season 5', leagueId: 'alpha', prize: '$50,000' },
  { id: 'T2', name: 'Beta Amateur Cup', leagueId: 'beta', prize: '$5,000' },
  { id: 'T3', name: 'Gamma Global Invitational', leagueId: 'gamma', prize: '$100,000' }
];

const teams = [
  { 
    id: 'TEAM-01', 
    name: 'Cloud Strikers', 
    leagueId: 'alpha', 
    region: 'NA',
    roster: ['C9-Shroud', 'C9-TenZ', 'C9-Stewie2K', 'C9-Autimatic', 'C9-Skadoodle']
  },
  { 
    id: 'TEAM-02', 
    name: 'Neon Samurai', 
    leagueId: 'alpha', 
    region: 'JP',
    roster: ['NS-ZETA', 'NS-Laz', 'NS-Dep', 'NS-SugarZ3ro', 'NS-Crow']
  },
  { 
    id: 'TEAM-03', 
    name: 'Frost Giants', 
    leagueId: 'beta', 
    region: 'EU',
    roster: ['FG-Olof', 'FG-GetRight', 'FG-Forest', 'FG-Friberg', 'FG-Xizt']
  },
  { 
    id: 'TEAM-04', 
    name: 'Desert Eagles', 
    leagueId: 'beta', 
    region: 'ME',
    roster: ['DE-S1mple', 'DE-Electronic', 'DE-Perfecto', 'DE-B1ad3', 'DE-Boombl4']
  }
];

const matches = [
  { id: 'M-101', tournamentId: 'T1', round: 'Quarter-Final', teamA: 'Cloud Strikers', teamB: 'Neon Samurai', score: '2-1', status: 'finished' },
  { id: 'M-102', tournamentId: 'T1', round: 'Quarter-Final', teamA: 'TBD', teamB: 'TBD', score: '0-0', status: 'upcoming' },
  { id: 'M-201', tournamentId: 'T2', round: 'Final', teamA: 'Frost Giants', teamB: 'Desert Eagles', score: '3-0', status: 'finished' }
];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: 'site023', status: 'healthy' });
});

// 2. GET /api/tournaments (bug01)
app.get('/api/tournaments', (req, res) => {
  const { leagueId } = req.query;

  // INTENTIONAL BACKEND BUG: site023-bug01
  // Type: schema-isolation-failure
  // Description: leagueId=alpha 요청 시 타 리그(beta, gamma) 데이터가 유출되어 함께 노출됨
  if (leagueId === 'alpha') {
    return res.json({
      success: true,
      data: tournaments, // Should have filtered by leagueId
      bugId: 'site023-bug01'
    });
  }

  const filtered = tournaments.filter(t => !leagueId || t.leagueId === leagueId);
  res.json({ success: true, data: filtered });
});

app.get('/api/tournaments/:id', (req, res) => {
  const t = tournaments.find(x => x.id === req.params.id);
  res.json({ success: true, data: t });
});

// 3. GET /api/teams (bug02)
app.get('/api/teams', (req, res) => {
  // INTENTIONAL BACKEND BUG: site023-bug02
  // Type: tenant-filter-missing-query
  // Description: 특정 테넌트 필터 없이 전체 팀 목록을 반환하여 격리 실패
  res.json({
    success: true,
    data: teams,
    bugId: 'site023-bug02'
  });
});

app.get('/api/teams/:id', (req, res) => {
  const team = teams.find(t => t.id === req.params.id);
  if (team) {
    res.json({ success: true, data: team });
  } else {
    res.status(404).json({ success: false, message: 'Team not found' });
  }
});

// 4. GET /api/matches
app.get('/api/matches', (req, res) => {
  res.json({ success: true, data: matches });
});

// 5. GET /api/matches/:id (bug03)
app.get('/api/matches/:id', (req, res) => {
  const match = matches.find(m => m.id === req.params.id);
  
  // INTENTIONAL BACKEND BUG: site023-bug03
  // Type: join-data-leak
  // Description: 특정 경기 조회 시 Join 로직 오류로 인해 다른 토너먼트의 경기 데이터가 포함됨
  if (match) {
    const unrelatedMatch = matches.find(m => m.tournamentId !== match.tournamentId);
    return res.json({
      success: true,
      data: match,
      relatedMatches: [match, unrelatedMatch], // Leak: unrelatedMatch included
      bugId: 'site023-bug03'
    });
  }
  
  res.status(404).json({ message: 'Match not found' });
});

// 6. GET /api/brackets (bug04)
app.get('/api/brackets', (req, res) => {
  const rounds = [
    { round: 1, name: 'Round of 16', matches: 8 },
    { round: 2, name: 'Quarter-Finals', matches: 4 },
    { round: 3, name: 'Semi-Finals', matches: 2 },
    { round: 4, name: 'Finals', matches: 1 }
  ];

  // INTENTIONAL BACKEND BUG: site023-bug04
  // Type: index-mixing-inconsistency
  // Description: 정렬 인덱스가 뒤섞여 라운드 순서가 비논리적으로 반환됨 (예: 결승이 처음에 옴)
  const mixedRounds = [rounds[3], rounds[0], rounds[2], rounds[1]];
  
  res.json({
    success: true,
    data: mixedRounds,
    bugId: 'site023-bug04'
  });
});

app.post('/api/matches/result', (req, res) => {
  res.json({ success: true, message: 'Result updated successfully' });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Esports Server running on http://localhost:${PORT}`);
});
