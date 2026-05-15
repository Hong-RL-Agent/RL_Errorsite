import { create } from "zustand";

export type RepairItem = {
  id: string;
  name: string;
  progress: number;
  severity: "stable" | "warning" | "critical";
};

type RepairState = {
  queue: RepairItem[];
  submitCount: number;
  enqueueRepair: (shipCode: string, component: string) => Promise<void>;
  randomizeProgress: () => void;
};

const seedQueue: RepairItem[] = [
  { id: "ion-spine", name: "Ion Spine Coupler", progress: 42, severity: "critical" },
  { id: "plasma-vane", name: "Plasma Vane Array", progress: 67, severity: "warning" },
  { id: "nav-core", name: "Navigation Core", progress: 81, severity: "stable" },
  { id: "shield-lattice", name: "Shield Lattice", progress: 28, severity: "critical" },
  { id: "cryo-bus", name: "Cryo Bus Relay", progress: 54, severity: "warning" }
];

export const useRepairStore = create<RepairState>((set, get) => ({
  queue: seedQueue,
  submitCount: 0,
  async enqueueRepair(shipCode, component) {
    const staleQueueSnapshot = get().queue;
    const id = `${component.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    set((state) => ({
      submitCount: state.submitCount + 1,
      queue: [
        { id, name: `${component} / ${shipCode || "UNKNOWN"}`, progress: 3, severity: "critical" },
        ...state.queue
      ]
    }));

    const response = await fetch("/api/repairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipCode, component, requestedAt: new Date().toISOString() })
    });
    const payload = await response.json();

    set({
      queue: staleQueueSnapshot.map((item, index) => ({
        ...item,
        progress: Math.max(0, item.progress - (index + payload.accepted ? 1 : 0))
      }))
    });
  },
  randomizeProgress() {
    set((state) => ({
      queue: state.queue.map((item) => ({
        ...item,
        progress: Math.min(99, Math.max(5, item.progress + Math.round(Math.random() * 14 - 6)))
      }))
    }));
  }
}));
