import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  Layers, 
  RefreshCw, 
  Settings, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Play,
  Search,
  Activity,
  History,
  Info
} from 'lucide-react';

const API_BASE = ''; // Same origin

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [agents, setAgents] = useState([]);
  const [health, setHealth] = useState({ ok: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [updateJobs, setUpdateJobs] = useState([]);
  const [actionSpace, setActionSpace] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [effectiveConfig, setEffectiveConfig] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/api/health`),
        fetch(`${API_BASE}/api/agents`)
      ]);
      const hData = await hRes.json();
      const aData = await aRes.json();
      setHealth(hData);
      setAgents(aData);
    } catch (err) {
      setError('Failed to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message, type = 'info', bugId = null) => {
    const newLog = { 
      id: Date.now(), 
      timestamp: new Date().toLocaleTimeString(), 
      message, 
      type,
      bugId 
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleRunUpdate = async (scenario = '') => {
    addLog(`Initiating background update... (Scenario: ${scenario || 'default'})`, 'info');
    try {
      const res = await fetch(`${API_BASE}/api/updates/run${scenario ? `?scenario=${scenario}` : ''}`, { method: 'POST' });
      const data = await res.json();
      addLog(`Update job ${data.jobId} completed successfully.`, 'success');
      fetchData();
    } catch (err) {
      addLog('Failed to trigger update.', 'error');
    }
  };

  const handleSaveSettings = async (agentId) => {
    addLog(`Saving settings for ${agentId}...`, 'info');
    try {
      const res = await fetch(`${API_BASE}/api/agents/${agentId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature: 0.8 })
      });
      const data = await res.json();
      if (!res.ok) {
        addLog(`Error saving settings: ${data.message}`, 'error', data.bugId);
      } else {
        addLog(`Settings for ${agentId} updated.`, 'success');
      }
    } catch (err) {
      addLog('API error occurred.', 'error');
    }
  };

  const handleExecuteAction = async (agentId, action) => {
    addLog(`Executing action '${action}' for ${agentId}...`, 'info');
    try {
      const res = await fetch(`${API_BASE}/api/agents/${agentId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) {
        addLog(`Action failed: ${data.message}`, 'error', data.bugId);
      } else {
        addLog(`Action '${action}' executed successfully.`, 'success');
      }
    } catch (err) {
      addLog('API error occurred.', 'error');
    }
  };

  const checkCompatibility = async (agentId) => {
    addLog(`Checking compatibility for ${agentId}...`, 'info');
    try {
      const res = await fetch(`${API_BASE}/api/models/compatibility?agentId=${agentId}`);
      const data = await res.json();
      setCompatibility(data);
      if (data.bugId) {
        addLog(`Compatibility check finished. (Debug: ${data.details})`, 'warning', data.bugId);
      } else {
        addLog('Compatibility check finished.', 'success');
      }
    } catch (err) {
      addLog('API error occurred.', 'error');
    }
  };

  const applyGlobalUpdate = async () => {
    addLog('Applying global policy update...', 'info');
    try {
      const res = await fetch(`${API_BASE}/api/config/apply-global-update`, { method: 'POST' });
      await res.json();
      addLog('Global policy updated (temperature -> 0.2).', 'success');
    } catch (err) {
      addLog('API error occurred.', 'error');
    }
  };

  const checkEffectiveConfig = async (agentId) => {
    addLog(`Fetching effective config for ${agentId}...`, 'info');
    try {
      const res = await fetch(`${API_BASE}/api/config/effective?agentId=${agentId}`);
      const data = await res.json();
      setEffectiveConfig(data);
      if (data.bugId) {
        addLog(`Effective config loaded. Warning: Override stuck detected.`, 'warning', data.bugId);
      } else {
        addLog('Effective config loaded.', 'success');
      }
    } catch (err) {
      addLog('API error occurred.', 'error');
    }
  };

  const renderOverview = () => (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Agents</div>
          <div className="stat-value">{agents.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Agents</div>
          <div className="stat-value">{agents.filter(a => a.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Locked Records</div>
          <div className="stat-value" style={{ color: agents.some(a => a.lockStatus === 'locked') ? 'var(--error)' : 'inherit' }}>
            {agents.filter(a => a.lockStatus === 'locked').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">System Health</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>99.9%</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>Agent Fleet</span>
          <button className="btn btn-outline btn-sm" onClick={fetchData}><RefreshCw size={14} /> Refresh</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Agent Name</th>
              <th>Status</th>
              <th>Base Model</th>
              <th>Adapter</th>
              <th>Lock Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.agentId}>
                <td><code>{agent.agentId}</code></td>
                <td>{agent.name}</td>
                <td><span className={`badge badge-${agent.status}`}>{agent.status.toUpperCase()}</span></td>
                <td>{agent.model}</td>
                <td>{agent.adapter}</td>
                <td>
                  {agent.lockStatus === 'locked' ? 
                    <span className="badge badge-locked" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> LOCKED
                    </span> : 
                    <span className="badge badge-active">UNLOCKED</span>
                  }
                </td>
                <td>
                  <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedAgent(agent)}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderActionSpace = () => (
    <div className="card">
      <div className="card-title">Action Space Matrix</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>UI Permitted Actions</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['summarize_ticket', 'route_to_team', 'draft_reply'].map(action => (
              <div key={action} className="stat-card" style={{ padding: '0.75rem', flex: '1 1 150px' }}>
                <div style={{ fontWeight: 'bold' }}>{action}</div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.75rem' }}
                  data-bug-id="site017-bug02"
                  onClick={() => handleExecuteAction('agent-aurora', action)}
                >
                  <Play size={12} /> Execute
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Server Validation Result</h4>
          <div className="log-panel" style={{ height: '150px' }}>
            {logs.filter(l => l.message.includes('Action')).map(l => (
              <div key={l.id} className="log-entry" style={{ color: l.type === 'error' ? 'var(--error)' : 'var(--success)' }}>
                [{l.timestamp}] {l.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderModelVersions = () => (
    <div className="panel-grid">
      <div className="card">
        <div className="card-title">Model Compatibility</div>
        <div className="stat-card" style={{ marginBottom: '1rem' }}>
          <div className="stat-label">Target Agent</div>
          <div className="stat-value" style={{ fontSize: '1rem' }}>agent-orion (Code Reviewer)</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div className="stat-card" style={{ flex: 1 }}>
            <div className="stat-label">Base Model</div>
            <div className="stat-value" style={{ fontSize: '1rem' }}>v3.2</div>
          </div>
          <div className="stat-card" style={{ flex: 1 }}>
            <div className="stat-label">Adapter</div>
            <div className="stat-value" style={{ fontSize: '1rem' }}>v3.1-coding</div>
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          data-bug-id="site017-bug03"
          onClick={() => checkCompatibility('agent-orion')}
        >
          Run Compatibility Check
        </button>
        {compatibility && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: compatibility.compatible ? 'var(--success)' : 'var(--error)' }}>
              {compatibility.compatible ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span style={{ fontWeight: 'bold' }}>Result: {compatibility.compatible ? 'COMPATIBLE' : 'INCOMPATIBLE'}</span>
            </div>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>{compatibility.details}</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Background Updates</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button className="btn btn-outline" onClick={() => handleRunUpdate()}>Default Update</button>
          <button 
            className="btn btn-primary" 
            data-bug-id="site017-bug01"
            onClick={() => handleRunUpdate('stuck-lock')}
          >
            Simulate Locked Update
          </button>
        </div>
        <div className="log-panel" style={{ height: '220px' }}>
          <div className="log-entry" style={{ color: '#94a3b8' }}>-- SYSTEM UPDATE LOG --</div>
          {logs.filter(l => l.message.includes('Update') || l.message.includes('job')).map(l => (
            <div key={l.id} className="log-entry">
              [{l.timestamp}] {l.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOverrides = () => (
    <div className="card">
      <div className="card-title">Policy & Overrides</div>
      <div className="panel-grid">
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Global Update Control</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Deploying a global update will set temperature to 0.2 across all agents unless a local override is prioritized.
          </p>
          <button 
            className="btn btn-primary" 
            data-bug-id="site017-bug04"
            onClick={applyGlobalUpdate}
          >
            Deploy Global Policy Update
          </button>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Effective Policy Check</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button className="btn btn-outline" onClick={() => checkEffectiveConfig('agent-aurora')}>Check Aurora</button>
            <button className="btn btn-outline" onClick={() => checkEffectiveConfig('agent-borealis')}>Check Borealis</button>
          </div>
          {effectiveConfig && (
            <div className="stat-card">
              <div className="stat-label">Source: {effectiveConfig.source}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span>Temperature</span>
                <span style={{ fontWeight: 'bold', color: effectiveConfig.effectiveConfig.temperature > 0.5 ? 'var(--warning)' : 'var(--success)' }}>
                  {effectiveConfig.effectiveConfig.temperature}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span>Max Tokens</span>
                <span style={{ fontWeight: 'bold' }}>{effectiveConfig.effectiveConfig.maxTokens}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
      <AlertCircle size={48} color="var(--error)" />
      <h1>System Failure</h1>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry Connection</button>
    </div>
  );

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <Layers size={28} /> AI OPS CONSOLE
        </div>
        <div className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
          <LayoutDashboard size={18} /> Overview
        </div>
        <div className={`nav-item ${activeTab === 'ActionSpace' ? 'active' : ''}`} onClick={() => setActiveTab('ActionSpace')}>
          <Zap size={18} /> Action Space
        </div>
        <div className={`nav-item ${activeTab === 'ModelVersions' ? 'active' : ''}`} onClick={() => setActiveTab('ModelVersions')}>
          <RefreshCw size={18} /> Updates & Models
        </div>
        <div className={`nav-item ${activeTab === 'Overrides' ? 'active' : ''}`} onClick={() => setActiveTab('Overrides')}>
          <Settings size={18} /> Policy Overrides
        </div>
        
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div className="health-status">
            <Activity size={14} /> {health.ok ? 'SYSTEM HEALTHY' : 'SYSTEM DEGRADED'}
          </div>
        </div>
      </div>

      <div className="main-content">
        <header>
          <div>
            <h1 style={{ fontSize: '1.875rem' }}>{activeTab}</h1>
            <p style={{ color: 'var(--text-muted)' }}>AI Ops Console &gt; site017 &gt; {activeTab}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>9126:CONNECTED</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', height: '50vh', justifyContent: 'center', alignItems: 'center' }}>
            <div className="loader"></div>
          </div>
        ) : (
          <>
            {logs.some(l => l.bugId) && (
              <div className="bug-banner">
                <AlertCircle size={24} color="var(--error)" />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="bug-id">{logs.find(l => l.bugId).bugId}</span>
                    <span style={{ fontWeight: 'bold' }}>Backend Logic Error Detected</span>
                  </div>
                  <p style={{ fontSize: '0.875rem' }}>{logs.find(l => l.bugId).message}</p>
                </div>
              </div>
            )}

            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'ActionSpace' && renderActionSpace()}
            {activeTab === 'ModelVersions' && renderModelVersions()}
            {activeTab === 'Overrides' && renderOverrides()}

            <div className="card">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={18} /> Console Logs
                </div>
              </div>
              <div className="log-panel" style={{ height: '150px' }}>
                {logs.length === 0 && <div className="log-entry" style={{ opacity: 0.5 }}>No recent activity...</div>}
                {logs.map(log => (
                  <div key={log.id} className={`log-entry ${log.type}`}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>[{log.timestamp}]</span>
                    <span style={{ color: log.type === 'error' ? 'var(--error)' : log.type === 'warning' ? 'var(--warning)' : '#a5f3fc' }}>
                      {log.message}
                    </span>
                    {log.bugId && <span style={{ marginLeft: '1rem', opacity: 0.7 }}>({log.bugId})</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedAgent && (
        <div className="modal-overlay" onClick={() => setSelectedAgent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Manage {selectedAgent.name}</h2>
              <button className="btn btn-outline" style={{ padding: '4px' }} onClick={() => setSelectedAgent(null)}>X</button>
            </div>
            
            <div className="panel-grid">
              <div>
                <h4 style={{ marginBottom: '1rem' }}>Settings</h4>
                <div className="stat-card" style={{ marginBottom: '1rem' }}>
                  <div className="stat-label">Model Configuration</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Temperature</span>
                    <span>{selectedAgent.settings.temperature}</span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  data-bug-id="site017-bug01"
                  onClick={() => handleSaveSettings(selectedAgent.agentId)}
                >
                  Save New Settings
                </button>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem' }}>Agent Status</h4>
                <div className={`stat-card ${selectedAgent.lockStatus === 'locked' ? 'badge-locked' : ''}`} style={{ marginBottom: '1rem', background: selectedAgent.lockStatus === 'locked' ? 'rgba(239, 68, 68, 0.1)' : '' }}>
                  <div className="stat-label">Database Lock Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    {selectedAgent.lockStatus === 'locked' ? <Lock size={16} /> : <CheckCircle2 size={16} />}
                    {selectedAgent.lockStatus.toUpperCase()}
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Last successful update: {selectedAgent.lastUpdate}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
