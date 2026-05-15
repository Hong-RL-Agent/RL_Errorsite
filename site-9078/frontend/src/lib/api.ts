export type NewsItem = {
  id: string;
  title: string;
  section: string;
  source: string;
  priority: 'breaking' | 'analysis' | 'alert';
  summary: string;
  trustScore: number;
  timestamp: string;
  signals: string[];
};

export type PreferenceMetric = {
  label: string;
  value: number;
  color: string;
};

export type InventoryItem = {
  component: string;
  type: string;
  version: string;
  owner: string;
  risk: string;
  finding: string;
};

export type RouteHop = {
  name: string;
  kind: string;
  region: string;
  latencyMs: number;
  state: string;
};

export type NetworkTrace = {
  id: string;
  routeName: string;
  status: string;
  hops: RouteHop[];
};

export type IncidentPattern = {
  id: number;
  name: string;
  severity: string;
  surface: string;
  indicator: string;
  simulationLog: string;
};

export type DashboardPayload = {
  news: NewsItem[];
  preferences: PreferenceMetric[];
  inventory: InventoryItem[];
  traces: NetworkTrace[];
  incidents: IncidentPattern[];
};

export async function fetchDashboard(): Promise<DashboardPayload> {
  const response = await fetch('/api/dashboard');
  if (!response.ok) {
    throw new Error(`NEWS-FEED API failed: ${response.status}`);
  }
  return response.json();
}
