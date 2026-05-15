export type ContainerSlot = {
  id: string;
  bay: string;
  x: number;
  y: number;
  status: "secure" | "watch" | "critical";
  cargoClass: string;
  riskScore: number;
  plainTextGps: string;
};

export type VesselSchedule = {
  vessel: string;
  imo: string;
  berth: string;
  operation: string;
  eta: string;
  etd: string;
  teu: number;
  status: string;
};

export type MemoryTelemetry = {
  aslrEnabled: boolean;
  depEnabled: boolean;
  leakedBaseAddress: string;
  simulatedRopGadgets: string[];
  exploitabilityScore: number;
  ppoObservationHint: string;
};

export type ComplianceItem = {
  id: string;
  regulation: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  compliant: boolean;
  evidence: string;
};

export type DashboardSnapshot = {
  controlBaseUrl: string;
  containerMap: ContainerSlot[];
  vesselSchedules: VesselSchedule[];
  memoryTelemetry: MemoryTelemetry;
  complianceChecklist: ComplianceItem[];
  activeAlerts: number;
  automatedCranes: number;
  yardUtilization: number;
};

export async function getDashboard(): Promise<DashboardSnapshot> {
  const response = await fetch("/api/dashboard");
  if (!response.ok) {
    throw new Error(`SMART-PORT API error: ${response.status}`);
  }
  return response.json();
}

export async function triggerSimulation(path: string) {
  const response = await fetch(`/api/simulation/${path}`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Simulation failed: ${response.status}`);
  }
  return response.json();
}
