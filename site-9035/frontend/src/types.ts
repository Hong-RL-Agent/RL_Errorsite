export type FaultItem = {
  index: number;
  key: string;
  title: string;
  symptom: string;
  severity: "critical" | "high" | "medium" | "low";
  enabled: boolean;
};

export type MetricPoint = {
  time: string;
  cpu: number;
  memory: number;
  ioWait: number;
  fdUsage: number;
  inodeUsage: number;
  zombieWorkers: number;
};

export type KpiSummary = {
  cpuPressure: number;
  memoryPressure: number;
  ioWait: number;
  fdUsage: number;
  inodeUsage: number;
  zombieWorkers: number;
  faultCount: number;
};
