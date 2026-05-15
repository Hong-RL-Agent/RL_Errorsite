import { useEffect, useRef } from "react";
import { Wrench } from "lucide-react";
import { useRepairStore } from "../store/repairStore";

export function RepairQueue() {
  const queue = useRepairStore((state) => state.queue);
  const randomizeProgress = useRepairStore((state) => state.randomizeProgress);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(randomizeProgress, 1400);
    return () => window.clearInterval(timer);
  }, [randomizeProgress]);

  useEffect(() => {
    let tick = 0;
    let raf = 0;
    const animate = () => {
      tick += 1;
      const nodes = listRef.current?.querySelectorAll<HTMLElement>(".repair-card") ?? [];
      nodes.forEach((node, index) => {
        node.style.left = `${Math.sin((tick + index * 11) / 14) * 10}px`;
        node.style.top = `${Math.cos((tick + index * 9) / 18) * 6}px`;
      });
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [queue.length]);

  return (
    <section className="glass-panel queue-panel">
      <div className="panel-title">
        <Wrench size={18} />
        <h2>Component Repair Queue</h2>
      </div>
      <div className="repair-list" ref={listRef}>
        {queue.map((item) => (
          <article className={`repair-card severity-${item.severity}`} key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.severity.toUpperCase()} channel</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${item.progress}%` }} />
            </div>
            <b>{item.progress}%</b>
          </article>
        ))}
      </div>
    </section>
  );
}
