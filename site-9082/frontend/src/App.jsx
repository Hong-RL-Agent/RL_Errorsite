import { useEffect, useMemo, useState } from 'react';
import EstateScene from './EstateScene.jsx';

const fallback = {
  platform: 'VIRTUAL-ESTATE',
  entrypoint: 'http://localhost:9082',
  metrics: {
    totalManagedValueUsd: 715500000,
    activeListings: 38,
    hybridRiskScore: 82,
    ppoDetectionConfidence: 94,
    openCriticalEvents: 3
  },
  assets: [
    { id: 'VE-PENT-001', name: 'Obsidian Sky Penthouse', district: 'Seoul Meta District', tier: 'Prime', valuationUsd: 184000000, trustScore: 96, status: 'Escrow protected' },
    { id: 'VE-VLTA-014', name: 'Aurum Vault Residence', district: 'Singapore Ledger Bay', tier: 'Ultra', valuationUsd: 221500000, trustScore: 92, status: 'Identity recheck' },
    { id: 'VE-ISLE-077', name: 'Emerald Private Island', district: 'Dubai Mirror Coast', tier: 'Sovereign', valuationUsd: 310000000, trustScore: 89, status: 'Wireless anomaly' }
  ],
  wirelessSignals: [
    { id: 'RF-01', protocol: 'Wi-Fi', label: 'Executive WPA2 Mesh', strength: 71, band: '5 GHz', posture: 'KRACK replay pattern', anomaly: 'Handshake retransmission spike' },
    { id: 'RF-02', protocol: 'Bluetooth', label: 'Admin Tablet BLE', strength: 83, band: '2.4 GHz', posture: 'Untrusted pairing', anomaly: 'Stack probe signature' },
    { id: 'RF-03', protocol: 'Rogue AP', label: 'VIRTUAL-ESTATE_GUEST_SECURE', strength: 64, band: '6 GHz', posture: 'Unapproved BSSID', anomaly: 'SSID impersonation' }
  ],
  events: [
    { id: 'EVT-001', category: 'Network', title: 'Pass-the-Ticket possibility', signal: 'Kerberos service ticket reused against asset escrow API', severity: 'Critical', location: 'Identity plane', confidence: 91 },
    { id: 'EVT-002', category: 'Network', title: 'NTLM relay scenario', signal: 'Intercepted NTLM challenge forwarded between SMB and estate contract portal', severity: 'High', location: 'Transaction subnet', confidence: 86 },
    { id: 'EVT-003', category: 'Wireless', title: 'Bluetooth stack exposure', signal: 'Admin device accepted suspicious BLE negotiation near control lounge', severity: 'High', location: 'Penthouse operations suite', confidence: 84 },
    { id: 'EVT-004', category: 'Wireless', title: 'KRACK encryption degradation', signal: 'WPA2 handshake replay sequence observed on broker Wi-Fi', severity: 'High', location: 'Broker floor', confidence: 88 },
    { id: 'EVT-005', category: 'Wireless', title: 'Rogue AP discovered', signal: 'Unknown access point mimics internal guest SSID', severity: 'Critical', location: 'Private auction hall', confidence: 93 },
    { id: 'EVT-006', category: 'Physical', title: 'Server room door opened', signal: 'Door contact triggered outside maintenance window without badge match', severity: 'Critical', location: 'Server room B2', confidence: 95 },
    { id: 'EVT-007', category: 'Physical', title: 'Tailgating detected', signal: 'Two silhouettes crossed after a single badge authorization', severity: 'High', location: 'Executive entrance', confidence: 90 },
    { id: 'EVT-008', category: 'Physical', title: 'Dumpster diving recovery trace', signal: 'Retired device serial found in external recovery workstation telemetry', severity: 'Medium', location: 'Asset disposal chain', confidence: 78 },
    { id: 'EVT-009', category: 'Physical', title: 'Shoulder surfing risk', signal: 'Camera angle overlaps password entry at wealth kiosk', severity: 'Medium', location: 'Lobby concierge', confidence: 74 },
    { id: 'EVT-010', category: 'Physical', title: 'Bugging signal captured', signal: 'Meeting room RF spectrum spike and voice archive hash drift', severity: 'High', location: 'Boardroom Aurum', confidence: 87 },
    { id: 'EVT-011', category: 'Physical', title: 'Laser microphone simulation', signal: 'Window vibration pattern correlates with external reflection pulses', severity: 'High', location: 'Glass suite 57F', confidence: 82 }
  ]
};

const severityClass = {
  Critical: 'severity severity-critical',
  High: 'severity severity-high',
  Medium: 'severity severity-medium'
};

export default function App({ iconMap }) {
  const [data, setData] = useState(fallback);
  const [selected, setSelected] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((response) => {
        if (!response.ok) throw new Error('dashboard api failed');
        return response.json();
      })
      .then(setData)
      .catch(() => setData(fallback))
      .finally(() => setLoading(false));
  }, []);

  const events = useMemo(() => {
    if (selected === 'All') return data.events;
    return data.events.filter((event) => event.category === selected);
  }, [data.events, selected]);

  const formatUsd = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);

  const categories = ['All', 'Network', 'Wireless', 'Physical'];
  const ShieldCheck = iconMap.ShieldCheck;
  const Building2 = iconMap.Building2;
  const Wifi = iconMap.Wifi;
  const Cctv = iconMap.Cctv;
  const Radar = iconMap.Radar;
  const KeyRound = iconMap.KeyRound;
  const Bluetooth = iconMap.Bluetooth;
  const RadioTower = iconMap.RadioTower;
  const DoorOpen = iconMap.DoorOpen;
  const Camera = iconMap.Camera;
  const AlertTriangle = iconMap.AlertTriangle;

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">HYBRID SECURITY OPERATIONS</p>
          <h1>VIRTUAL-ESTATE</h1>
        </div>
        <div className="status-pill">
          <ShieldCheck size={18} />
          <span>{data.entrypoint}</span>
        </div>
      </section>

      <section className="metric-grid">
        <Metric label="Managed Value" value={formatUsd(data.metrics.totalManagedValueUsd)} accent="gold" icon={<Building2 />} />
        <Metric label="Active Listings" value={data.metrics.activeListings} accent="emerald" icon={<KeyRound />} />
        <Metric label="Hybrid Risk" value={`${data.metrics.hybridRiskScore}/100`} accent="crimson" icon={<AlertTriangle />} />
        <Metric label="PPO Confidence" value={`${data.metrics.ppoDetectionConfidence}%`} accent="emerald" icon={<Radar />} />
      </section>

      <section className="mission-layout">
        <div className="visual-band">
          <div className="scene-header">
            <div>
              <p className="eyebrow">METAVERSE LAND LEDGER</p>
              <h2>Obsidian parcel command map</h2>
            </div>
            <span className="live-dot">{loading ? 'Syncing' : 'Live'}</span>
          </div>
          <EstateScene />
        </div>

        <aside className="panel asset-panel">
          <div className="panel-title">
            <Building2 size={19} />
            <h2>Asset Exchange</h2>
          </div>
          {data.assets.map((asset) => (
            <article className="asset-row" key={asset.id}>
              <div>
                <strong>{asset.name}</strong>
                <span>{asset.district}</span>
              </div>
              <div className="asset-value">
                <b>{formatUsd(asset.valuationUsd)}</b>
                <small>{asset.trustScore}% trust</small>
              </div>
            </article>
          ))}
        </aside>
      </section>

      <section className="lower-grid">
        <div className="panel wireless-panel">
          <div className="panel-title">
            <Wifi size={19} />
            <h2>Wireless Signal Watch</h2>
          </div>
          {data.wirelessSignals.map((signal) => {
            const Icon = signal.protocol === 'Bluetooth' ? Bluetooth : signal.protocol === 'Rogue AP' ? RadioTower : Wifi;
            return (
              <article className="signal-row" key={signal.id}>
                <Icon size={20} />
                <div className="signal-copy">
                  <strong>{signal.label}</strong>
                  <span>{signal.posture}</span>
                </div>
                <div className="bar" aria-label={`${signal.strength}%`}>
                  <i style={{ width: `${signal.strength}%` }} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="panel cctv-panel">
          <div className="panel-title">
            <Cctv size={19} />
            <h2>CCTV Physical Sensors</h2>
          </div>
          <div className="sensor-grid">
            <Sensor icon={<DoorOpen />} label="Server Door" value="Forced window" tone="crimson" />
            <Sensor icon={<Camera />} label="Tailgating" value="2:1 mismatch" tone="gold" />
            <Sensor icon={<RadioTower />} label="Bugging RF" value="Spike found" tone="crimson" />
            <Sensor icon={<Radar />} label="Glass Vibration" value="Laser trace" tone="emerald" />
          </div>
        </div>

        <div className="panel incident-panel">
          <div className="incident-head">
            <div className="panel-title">
              <AlertTriangle size={19} />
              <h2>Hybrid Vulnerability Log</h2>
            </div>
            <div className="segment">
              {categories.map((category) => (
                <button className={selected === category ? 'active' : ''} key={category} onClick={() => setSelected(category)}>
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="event-list">
            {events.map((event) => (
              <article className="event-row" key={event.id}>
                <div className="event-main">
                  <span className={severityClass[event.severity] || 'severity'}>{event.severity}</span>
                  <strong>{event.title}</strong>
                  <p>{event.signal}</p>
                </div>
                <div className="event-meta">
                  <span>{event.location}</span>
                  <b>{event.confidence}%</b>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, accent, icon }) {
  return (
    <article className={`metric metric-${accent}`}>
      <span className="metric-icon">{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function Sensor({ icon, label, value, tone }) {
  return (
    <article className={`sensor sensor-${tone}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
