export default function PredictiveMaintenancePanel() {
  return (
    <section className="glass panel compact-panel">
      <div>
        <p className="eyebrow">Predictive Maintenance</p>
        <h3>Axle thermal model online</h3>
      </div>
      <div className="maintenance-grid">
        <span>Brake wear</span><strong>18%</strong>
        <span>Motor bearing</span><strong>0.04g</strong>
        <span>Cooling loop</span><strong>72.1C</strong>
      </div>
    </section>
  );
}

