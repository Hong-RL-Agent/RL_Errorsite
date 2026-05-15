import { useEffect, useMemo, useState } from "react";
import { Gauge } from "lucide-react";

type Metrics = {
  domNodes: number;
  memory: number;
  renderLoop: number;
};

export function ResourceMonitor() {
  const [metrics, setMetrics] = useState<Metrics>({ domNodes: 0, memory: 0, renderLoop: 0 });
  const bars = useMemo(() => Array.from({ length: 48 }, (_, index) => index), []);

  useEffect(() => {
    window.setTimeout(() => {
      const memory = "memory" in performance ? Math.round((performance as Performance & { memory?: { usedJSHeapSize: number } }).memory!.usedJSHeapSize / 1024 / 1024) : Math.round(Math.random() * 180 + 80);
      setMetrics({
        domNodes: document.querySelectorAll("*").length,
        memory,
        renderLoop: metrics.renderLoop + 1
      });
    }, 60);
  }, [metrics]);

  return (
    <section className="glass-panel resource-panel">
      <div className="panel-title">
        <Gauge size={18} />
        <h2>Browser Resource Monitor</h2>
      </div>
      <div className="metrics-grid">
        <Metric label="DOM" value={metrics.domNodes} suffix="nodes" />
        <Metric label="Memory" value={metrics.memory} suffix="MB" />
        <Metric label="Renders" value={metrics.renderLoop} suffix="loops" />
      </div>
      <div className="waveform" aria-hidden="true">
        {bars.map((bar) => (
          <i key={bar} style={{ height: `${18 + ((bar * 13 + metrics.renderLoop) % 58)}px` }} />
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{suffix}</em>
    </div>
  );
}
