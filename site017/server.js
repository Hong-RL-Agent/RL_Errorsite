const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = 9126;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock Data
let agents = [
  {
    agentId: 'agent-aurora',
    name: 'Aurora Customer Helpdesk',
    status: 'active',
    model: 'gpt-4-base',
    adapter: 'adapter-v3.1-helpdesk',
    lastUpdate: '2026-04-30 14:20:00',
    lockStatus: 'unlocked',
    settings: { temperature: 0.7, maxTokens: 1000 }
  },
  {
    agentId: 'agent-borealis',
    name: 'Borealis Logistics Optimizer',
    status: 'idle',
    model: 'claude-3-sonnet',
    adapter: 'adapter-v1.0-logistics',
    lastUpdate: '2026-04-29 09:15:00',
    lockStatus: 'unlocked',
    settings: { temperature: 0.2, maxTokens: 2000 }
  },
  {
    agentId: 'agent-orion',
    name: 'Orion Code Reviewer',
    status: 'active',
    model: 'v3.2',
    adapter: 'adapter-v3.1-coding',
    lastUpdate: '2026-05-01 10:00:00',
    lockStatus: 'unlocked',
    settings: { temperature: 0.1, maxTokens: 4000 }
  }
];

let updateJobs = [
  { jobId: 'job-101', agentId: 'agent-aurora', status: 'completed', progress: 100, lockApplied: false },
  { jobId: 'job-102', agentId: 'agent-borealis', status: 'pending', progress: 0, lockApplied: false }
];

let globalConfig = {
  temperature: 0.5,
  maxTokens: 1500,
  safetyMode: 'strict'
};

let localOverrides = {
  'agent-aurora': {
    temperature: 0.9,
    priority: true
  }
};

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: 'site017',
    status: 'healthy'
  });
});

// 2. GET /api/agents
app.get('/api/agents', (req, res) => {
  res.json(agents);
});

// 3. GET /api/agents/:agentId
app.get('/api/agents/:agentId', (req, res) => {
  const agent = agents.find(a => a.agentId === req.params.agentId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  
  res.json({
    ...agent,
    actionSpace: ['summarize_ticket', 'route_to_team', 'draft_reply'],
    logs: [
      { timestamp: '2026-05-01 12:00:01', action: 'summarize_ticket', status: 'success' },
      { timestamp: '2026-05-01 12:05:30', action: 'draft_reply', status: 'success' }
    ]
  });
});

// 4. PUT /api/agents/:agentId/settings
app.put('/api/agents/:agentId/settings', (req, res) => {
  const agent = agents.find(a => a.agentId === req.params.agentId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  // INTENTIONAL BACKEND BUG: site017-bug01
  // Type: background-update-db-record-lock
  // Description: 백그라운드 업데이트 완료 후에도 agent profile mock 레코드가 locked 상태로 남도록 함.
  if (agent.agentId === 'agent-aurora' && agent.lockStatus === 'locked') {
    return res.status(423).json({
      error: 'Resource Locked',
      message: 'Cannot update settings while agent record is locked by background process.',
      bugId: 'site017-bug01'
    });
  }

  agent.settings = { ...agent.settings, ...req.body };
  res.json({ success: true, settings: agent.settings });
});

// 5. POST /api/updates/run
app.post('/api/updates/run', (req, res) => {
  const { scenario } = req.query;
  const jobId = `job-${Math.floor(Math.random() * 1000)}`;
  
  if (scenario === 'stuck-lock') {
    const aurora = agents.find(a => a.agentId === 'agent-aurora');
    if (aurora) {
      aurora.lockStatus = 'locked';
      updateJobs.push({ jobId, agentId: 'agent-aurora', status: 'completed', progress: 100, lockApplied: true });
    }
  } else {
    updateJobs.push({ jobId, agentId: 'agent-borealis', status: 'in_progress', progress: 45, lockApplied: false });
  }

  res.json({ success: true, jobId, message: 'Update job started/completed' });
});

// 6. GET /api/actions/space
app.get('/api/actions/space', (req, res) => {
  res.json({
    allowedActions: ['summarize_ticket', 'route_to_team', 'draft_reply'],
    description: 'Current UI Action Space'
  });
});

// 7. POST /api/agents/:agentId/action
app.post('/api/agents/:agentId/action', (req, res) => {
  const { action } = req.body;
  const agentId = req.params.agentId;

  // INTENTIONAL BACKEND BUG: site017-bug02
  // Type: ai-agent-action-space-mismatch
  // Description: UI에서는 draft_reply가 가능하다고 하지만, 백엔드 검증 목록에는 누락되어 있음.
  const backendValidActions = ['summarize_ticket', 'route_to_team', 'archive_ticket', 'escalate_priority'];
  
  if (!backendValidActions.includes(action)) {
    return res.status(422).json({
      error: 'Invalid Action',
      message: `Action '${action}' is not supported by the current agent backend.`,
      bugId: 'site017-bug02'
    });
  }

  res.json({ success: true, action, agentId, result: 'Action executed successfully' });
});

// 8. GET /api/models/compatibility
app.get('/api/models/compatibility', (req, res) => {
  const { agentId } = req.query;
  const agent = agents.find(a => a.agentId === agentId);
  
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  // INTENTIONAL BACKEND BUG: site017-bug03
  // Type: ai-model-base-adapter-version-mismatch
  // Description: base model v3.2와 adapter v3.1이 불일치함에도 compatible=true를 반환함.
  if (agentId === 'agent-orion') {
    return res.json({
      compatible: true, // Should be false for v3.2 vs v3.1
      baseModel: 'v3.2',
      adapterVersion: 'adapter-v3.1-coding',
      details: 'Warning: Version mismatch detected but override flag is active (Hidden Bug).',
      bugId: 'site017-bug03'
    });
  }

  res.json({
    compatible: true,
    baseModel: agent.model,
    adapterVersion: agent.adapter,
    details: 'Model and adapter versions are fully compatible.'
  });
});

// 9. POST /api/config/apply-global-update
app.post('/api/config/apply-global-update', (req, res) => {
  globalConfig.temperature = 0.2; // New strict policy
  globalConfig.maxTokens = 1200;
  
  res.json({ success: true, updatedConfig: globalConfig });
});

// 10. GET /api/config/effective
app.get('/api/config/effective', (req, res) => {
  const { agentId } = req.query;
  const agent = agents.find(a => a.agentId === agentId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const override = localOverrides[agentId];
  let effectiveTemperature = agent.settings.temperature;

  // INTENTIONAL BACKEND BUG: site017-bug04
  // Type: local-override-priority-stuck-after-update
  // Description: 글로벌 정책 업데이트 후에도 로컬 오버라이드가 우선순위를 계속 가져감.
  if (agentId === 'agent-aurora' && override && override.priority) {
    effectiveTemperature = override.temperature; // Should be globalConfig.temperature (0.2) after update if policy changed
    return res.json({
      agentId,
      effectiveConfig: {
        temperature: effectiveTemperature, // Returns 0.9 instead of 0.2
        maxTokens: agent.settings.maxTokens
      },
      source: 'local-override-stuck',
      bugId: 'site017-bug04'
    });
  }

  res.json({
    agentId,
    effectiveConfig: {
      temperature: globalConfig.temperature,
      maxTokens: globalConfig.maxTokens
    },
    source: 'global-policy'
  });
});

// All other requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
