import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  Gauge,
  RadioTower,
  Route,
  SatelliteDish,
  ShieldAlert,
  Zap
} from 'lucide-react';
import * as THREE from 'three';
import './styles.css';

const fallbackSnapshot = {
  venue: 'MAGENTA DOME PRIME',
  liveViewers: 1914000,
  concurrentSessions: 681000,
  fanPulse: 94.6,
  streamBitrateGbps: 83.4,
  packetLossPercent: 3.8,
  heatmap: [
    { section: 'N-101', intensity: 96, latencyMs: 45, mood: 'ROAR' },
    { section: 'N-204', intensity: 78, latencyMs: 62, mood: 'CHANT' },
    { section: 'E-116', intensity: 91, latencyMs: 77, mood: 'SURGE' },
    { section: 'E-302', intensity: 68, latencyMs: 96, mood: 'FLASH' },
    { section: 'S-118', intensity: 87, latencyMs: 58, mood: 'ROAR' },
    { section: 'S-409', intensity: 73, latencyMs: 110, mood: 'OVERTIME' },
    { section: 'W-122', intensity: 98, latencyMs: 69, mood: 'SURGE' },
    { section: 'W-280', intensity: 71, latencyMs: 102, mood: 'CHANT' }
  ],
  network: {
    primaryRegion: 'ICN-MAGENTA-1',
    bgpRoutes: 221400,
    blackholedRoutes: 3,
    mtu: 1400,
    expectedMtu: 1500,
    natPortsUsed: 59880,
    natPortsTotal: 64000,
    edgeCacheHitRatio: 90.7,
    bandwidthUtilization: 97.1,
    routes: [
      { path: 'viewer -> edge-seoul -> origin-a', state: 'ASYMMETRIC', latencyMs: 88, utilization: 0.91, defect: 'return path mismatch' },
      { path: 'edge-tokyo -> bgp-core -> replay-vod', state: 'BLACKHOLED', latencyMs: 214, utilization: 0.03, defect: 'invalid route-map' },
      { path: 'arena-ws -> fan-pulse-bus', state: 'DEGRADED', latencyMs: 145, utilization: 0.78, defect: 'websocket reconnect stuck' }
    ]
  },
  incidents: [],
  operationLogs: [
    { time: '22:09:08', source: 'bgp-watch', level: 'WARN', message: 'prefix 10.98.0.0/18 advertised to blackhole community' },
    { time: '22:09:08', source: 'secret-rotator', level: 'FATAL', message: 'cdn-origin-token expired; connection gate closed' }
  ]
};

function useSnapshot() {
  const [snapshot, setSnapshot] = useState(fallbackSnapshot);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/stadium/snapshot', { cache: 'no-store' });
        if (!response.ok) throw new Error(`API ${response.status}`);
        const data = await response.json();
        if (active) {
          setSnapshot(data);
          setOnline(true);
        }
      } catch {
        if (active) setOnline(false);
      }
    };

    load();
    const timer = window.setInterval(load, 3000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return { snapshot, online };
}

function StadiumScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 6, 13);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const dome = new THREE.Mesh(
      new THREE.TorusGeometry(4.9, 0.18, 18, 160),
      new THREE.MeshStandardMaterial({ color: 0xff0080, emissive: 0xff0080, emissiveIntensity: 1.4, metalness: 0.4, roughness: 0.15 })
    );
    dome.rotation.x = Math.PI / 2;
    scene.add(dome);

    const field = new THREE.Mesh(
      new THREE.CircleGeometry(4.45, 96),
      new THREE.MeshStandardMaterial({ color: 0x2a001b, emissive: 0x4d0030, emissiveIntensity: 0.45, roughness: 0.3 })
    );
    field.rotation.x = -Math.PI / 2;
    scene.add(field);

    const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 1.8 });
    const rings = [1.6, 2.6, 3.6].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.025, 8, 128), ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.04 + index * 0.08;
      scene.add(ring);
      return ring;
    });

    const towers = [];
    for (let i = 0; i < 20; i += 1) {
      const angle = (Math.PI * 2 * i) / 20;
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.1 + (i % 4) * 0.25, 0.12),
        new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0xffffff : 0xff0080, emissive: i % 3 === 0 ? 0xffffff : 0xff0080, emissiveIntensity: 0.75 })
      );
      tower.position.set(Math.cos(angle) * 5.2, 0.55, Math.sin(angle) * 5.2);
      tower.lookAt(0, 0.55, 0);
      scene.add(tower);
      towers.push(tower);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const magentaLight = new THREE.PointLight(0xff0080, 10, 20);
    magentaLight.position.set(-4, 5, 3);
    scene.add(magentaLight);
    const yellowLight = new THREE.PointLight(0xffff00, 8, 18);
    yellowLight.position.set(4, 4, -3);
    scene.add(yellowLight);

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', resize);

    let frame = 0;
    let animationId = 0;
    const animate = () => {
      frame += 0.01;
      dome.rotation.z += 0.004;
      rings.forEach((ring, index) => {
        ring.scale.setScalar(1 + Math.sin(frame * 2 + index) * 0.025);
      });
      towers.forEach((tower, index) => {
        tower.scale.y = 1 + Math.sin(frame * 3 + index) * 0.08;
      });
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="stadium-canvas" ref={mountRef} aria-label="3D 가상 경기장 렌더링 뷰어" />;
}

function Metric({ icon: Icon, label, value, suffix, tone = 'magenta' }) {
  return (
    <div className={`metric metric-${tone}`}>
      <div className="metric-icon"><Icon size={18} /></div>
      <div>
        <p>{label}</p>
        <strong>{value}<span>{suffix}</span></strong>
      </div>
    </div>
  );
}

function Heatmap({ cells }) {
  return (
    <section className="panel heatmap-panel">
      <div className="panel-title">
        <RadioTower size={18} />
        <h2>관중 열기 히트맵</h2>
      </div>
      <div className="heat-grid">
        {cells.map((cell) => (
          <div
            className="heat-cell"
            key={cell.section}
            style={{
              '--alpha': cell.intensity / 180,
              '--delay': `${cell.latencyMs}ms`
            }}
          >
            <span>{cell.section}</span>
            <strong>{cell.intensity}</strong>
            <em>{cell.mood} / {cell.latencyMs}ms</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function NetworkPanel({ network }) {
  const natPercent = Math.round((network.natPortsUsed / network.natPortsTotal) * 100);

  return (
    <section className="panel network-panel">
      <div className="panel-title">
        <Route size={18} />
        <h2>BGP / MTU / 대역폭 텔레메트리</h2>
      </div>
      <div className="telemetry-bars">
        <Bar label="Bandwidth" value={network.bandwidthUtilization} suffix="%" />
        <Bar label="SNAT Ports" value={natPercent} suffix="%" />
        <Bar label="Edge Cache" value={network.edgeCacheHitRatio} suffix="%" />
        <Bar label={`MTU ${network.mtu}/${network.expectedMtu}`} value={(network.mtu / network.expectedMtu) * 100} suffix="%" />
      </div>
      <div className="route-list">
        {network.routes.map((route) => (
          <article key={route.path}>
            <div>
              <b>{route.state}</b>
              <span>{route.path}</span>
            </div>
            <p>{route.defect}</p>
            <strong>{route.latencyMs}ms</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function Bar({ label, value, suffix }) {
  return (
    <div className="bar-row">
      <div>
        <span>{label}</span>
        <strong>{Math.round(value)}{suffix}</strong>
      </div>
      <div className="bar-track"><i style={{ width: `${Math.min(value, 100)}%` }} /></div>
    </div>
  );
}

function Terminal({ logs }) {
  return (
    <section className="terminal">
      <div className="terminal-top">
        <SatelliteDish size={18} />
        <h2>배포 및 시크릿 상태 로그</h2>
      </div>
      <div className="terminal-lines">
        {logs.map((log, index) => (
          <p key={`${log.source}-${index}`}>
            <span>{log.time}</span>
            <b>{log.level}</b>
            <em>{log.source}</em>
            {log.message}
          </p>
        ))}
      </div>
    </section>
  );
}

function App() {
  const { snapshot, online } = useSnapshot();
  const criticalCount = useMemo(
    () => snapshot.incidents.filter((incident) => incident.severity === 'CRITICAL').length,
    [snapshot.incidents]
  );

  return (
    <main className="app-shell">
      <div className="motion-beam beam-a" />
      <div className="motion-beam beam-b" />
      <header className="topbar">
        <div>
          <span className="eyebrow">LIVE OPS / PORT 9098</span>
          <h1>VIRTUAL-STADIUM</h1>
          <p>{snapshot.venue} 실시간 중계 네트워크 관제</p>
        </div>
        <div className={`status-pill ${online ? 'online' : 'offline'}`}>
          <span />
          {online ? 'API LIVE' : 'LOCAL FALLBACK'}
        </div>
      </header>

      <section className="hero-grid">
        <div className="stadium-panel">
          <div className="stadium-label">
            <Zap size={18} />
            <span>3D 가상 경기장 렌더링</span>
          </div>
          <StadiumScene />
        </div>
        <div className="metrics-grid">
          <Metric icon={Activity} label="Fan Pulse" value={snapshot.fanPulse} suffix="%" />
          <Metric icon={Gauge} label="Streaming" value={snapshot.streamBitrateGbps} suffix="Gbps" tone="yellow" />
          <Metric icon={ShieldAlert} label="Packet Loss" value={snapshot.packetLossPercent} suffix="%" tone="white" />
          <Metric icon={AlertTriangle} label="Critical Incidents" value={criticalCount || 5} suffix="" tone="yellow" />
        </div>
      </section>

      <section className="summary-strip">
        <div><span>Live Viewers</span><strong>{snapshot.liveViewers.toLocaleString()}</strong></div>
        <div><span>Concurrent Sessions</span><strong>{snapshot.concurrentSessions.toLocaleString()}</strong></div>
        <div><span>BGP Routes</span><strong>{snapshot.network.bgpRoutes.toLocaleString()}</strong></div>
        <div><span>Blackholed</span><strong>{snapshot.network.blackholedRoutes}</strong></div>
      </section>

      <section className="ops-grid">
        <Heatmap cells={snapshot.heatmap} />
        <NetworkPanel network={snapshot.network} />
      </section>

      <section className="incident-grid">
        {snapshot.incidents.slice(0, 6).map((incident) => (
          <article className="incident-card" key={incident.id}>
            <span>{incident.id}</span>
            <h3>{incident.title}</h3>
            <p>{incident.signal}</p>
            <b>{incident.severity}</b>
          </article>
        ))}
      </section>

      <Terminal logs={snapshot.operationLogs} />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
