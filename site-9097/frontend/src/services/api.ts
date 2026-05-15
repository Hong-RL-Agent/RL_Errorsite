export type DashboardSnapshot = {
  timestamp: string;
  vehicles: Array<{
    id: string;
    driver: string;
    zone: string;
    lat: number;
    lng: number;
    fillCollected: number;
    battery: number;
    routeState: string;
  }>;
  zones: Array<{
    zone: string;
    district: string;
    fillPercent: number;
    organic: number;
    recyclable: number;
    hazard: number;
    status: 'stable' | 'warning' | 'critical';
  }>;
  network: Array<{
    layer: string;
    status: string;
    latencyMs: number;
    lossRate: number;
    faultPattern: string;
    impact: string;
  }>;
  faults: Array<{
    code: string;
    severity: string;
    title: string;
    detail: string;
    observedAt: string;
  }>;
  preflight: Record<string, unknown>;
};

export async function fetchDashboard(): Promise<DashboardSnapshot> {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-WM-Client': 'waste-mgmt-react-console',
      'X-WM-Preflight-Probe': crypto.randomUUID()
    }
  });

  if (!response.ok) {
    throw new Error(`Dashboard request failed: ${response.status}`);
  }

  return response.json();
}

export async function probeProxyDelay(): Promise<number> {
  const response = await fetch('/api/faults/proxy-delay', {
    headers: {
      'X-WM-Client': 'waste-mgmt-react-console',
      'X-WM-Preflight-Probe': crypto.randomUUID()
    }
  });
  return response.status;
}

export async function sendOptionsProbe(path = '/api/dashboard'): Promise<number> {
  const response = await fetch(path, {
    method: 'OPTIONS',
    headers: {
      'X-WM-Client': 'waste-mgmt-react-console',
      'X-WM-Preflight-Probe': crypto.randomUUID()
    }
  });
  return response.status;
}
