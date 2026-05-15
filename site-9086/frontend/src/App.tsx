import { Activity, AlertTriangle, Cpu, Radar, Satellite } from "lucide-react";
import { RepairConsole } from "./components/RepairConsole";
import { RepairQueue } from "./components/RepairQueue";
import { ReportsLayer } from "./components/ReportsLayer";
import { ResourceMonitor } from "./components/ResourceMonitor";
import { RemoteAssist } from "./components/RemoteAssist";
import { ShipWireframe } from "./components/ShipWireframe";
import { useRepairStore } from "./store/repairStore";

export function App() {
  const queue = useRepairStore((state) => state.queue);
  const critical = queue.filter((item) => item.severity === "critical").length;

  return (
    <main className="app-shell">
      <div className="abyss-grid" />
      <header className="command-header">
        <section>
          <p className="eyebrow">Deep Orbit Drydock / Port 9086</p>
          <h1>COSMIC-REPAIR</h1>
        </section>
        <nav className="status-strip" aria-label="repair telemetry">
          <span><Radar size={16} /> uplink stable</span>
          <span><Cpu size={16} /> DOM stress armed</span>
          <span><AlertTriangle size={16} /> {critical} critical faults</span>
        </nav>
      </header>

      <section className="dashboard-grid">
        <div className="wireframe-zone">
          <ShipWireframe />
          <div className="ship-caption glass-panel">
            <Satellite size={18} />
            <div>
              <strong>Asterion-7 Hull Scan</strong>
              <span>WebGL wireframe diagnostics with volatile context handling</span>
            </div>
          </div>
        </div>

        <aside className="right-rail">
          <RepairConsole />
          <RemoteAssist />
        </aside>

        <section className="bottom-deck">
          <RepairQueue />
          <ResourceMonitor />
        </section>
      </section>

      <ReportsLayer />
      <footer className="telemetry-footer">
        <Activity size={16} />
        <span>Client performance logs enabled through nginx and browser console probes.</span>
      </footer>
    </main>
  );
}
