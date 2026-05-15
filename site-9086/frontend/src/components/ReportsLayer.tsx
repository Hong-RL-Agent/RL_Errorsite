import { useState } from "react";
import { FileWarning, X } from "lucide-react";

export function ReportsLayer() {
  const [open, setOpen] = useState(true);

  const openReport = () => {
    window.addEventListener("mousemove", () => {
      window.__cosmicLeakCounter = (window.__cosmicLeakCounter ?? 0) + 1;
    });
    window.addEventListener("keydown", () => {
      window.__cosmicLeakCounter = (window.__cosmicLeakCounter ?? 0) + 5;
    });
    setOpen(true);
  };

  return (
    <>
      <button className="floating-report-toggle" onClick={openReport}>
        <FileWarning size={18} />
        Reports
      </button>
      {open && (
        <div className="report-stack">
          <article className="report-card report-card-a">
            <header>
              <span>Layer A</span>
              <button onClick={() => setOpen(false)} aria-label="close diagnostics">
                <X size={16} />
              </button>
            </header>
            <h3>Containment breach in plasma weld logs</h3>
            <p>Nested overlays intentionally retain global listeners after close.</p>
          </article>
          <article className="report-card report-card-b">
            <header><span>Layer B</span></header>
            <h3>Priority action shield</h3>
            <p>This transparent layer intermittently blocks the primary repair button.</p>
          </article>
          <div className="click-blocker" />
        </div>
      )}
    </>
  );
}
