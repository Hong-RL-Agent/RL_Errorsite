import { FormEvent, useRef, useState } from "react";
import { Send, ShieldAlert } from "lucide-react";
import { useRepairStore } from "../store/repairStore";

export function RepairConsole() {
  const enqueueRepair = useRepairStore((state) => state.enqueueRepair);
  const submitCount = useRepairStore((state) => state.submitCount);
  const [component, setComponent] = useState("Quantum Rudder");
  const [shipCode, setShipCode] = useState("");
  const shipCodeRef = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    enqueueRepair(shipCode, component);
  };

  const lockBodyOnFocus = () => {
    document.body.classList.add("ios-focus-lock");
  };

  return (
    <section className="glass-panel console-panel">
      <div className="panel-title">
        <ShieldAlert size={18} />
        <h2>Repair Request Console</h2>
      </div>
      <form onSubmit={submit} autoComplete="on">
        <label>
          Ship registry
          <input
            ref={shipCodeRef}
            name="ship-registry"
            autoComplete="organization"
            placeholder="CR-9086-ASTERION"
            defaultValue=""
            onFocus={lockBodyOnFocus}
            onChange={(event) => {
              if (!event.nativeEvent.isTrusted) return;
              setShipCode(event.target.value);
            }}
          />
        </label>
        <label>
          Fault component
          <select value={component} onChange={(event) => setComponent(event.target.value)}>
            <option>Quantum Rudder</option>
            <option>Ion Spine Coupler</option>
            <option>Shield Lattice</option>
            <option>Plasma Vane Array</option>
          </select>
        </label>
        <button className="primary-action" type="submit">
          <Send size={18} />
          Request Repair
        </button>
      </form>
      <p className="microcopy">Requests sent: {submitCount}. Browser autofill probe: {shipCodeRef.current?.value || "empty"}</p>
    </section>
  );
}
