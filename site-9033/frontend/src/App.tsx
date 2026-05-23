import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Cloud,
  ServerCrash,
  ShieldAlert,
  Workflow
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { cn } from "./lib/cn";

type Metrics = {
  activeNodes: number;
  failedJobs: number;
  deploySuccessRate: number;
  incidentCount: number;
  lastUpdated: string;
};

type Timeline = {
  stage: string;
  latency: number;
  errors: number;
};

const leakedLogs = [
  "[2026-04-30T00:10:12Z] aws configure set aws_access_key_id AKIADEMOEXPOSEDKEY",
  "[2026-04-30T00:10:12Z] aws configure set aws_secret_access_key wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "[2026-04-30T00:11:57Z] export DB_PASSWORD=super-prod-db-password-raw",
  "[2026-04-30T00:13:21Z] kubectl apply -f deploy.yaml --record"
];

const metricCards = [
  { key: "activeNodes", label: "Active Nodes", icon: Cloud },
  { key: "failedJobs", label: "Failed Jobs", icon: ServerCrash },
  { key: "deploySuccessRate", label: "Deploy Success %", icon: Workflow },
  { key: "incidentCount", label: "Open Incidents", icon: AlertTriangle }
] as const;

export default function App() {
  const [metrics, setMetrics] = useState<Metrics>({
    activeNodes: 0,
    failedJobs: 0,
    deploySuccessRate: 0,
    incidentCount: 0,
    lastUpdated: ""
  });
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [metadataPreview, setMetadataPreview] = useState("Loading metadata endpoint...");
  const [cachedErrorPreview, setCachedErrorPreview] = useState("Loading cached error endpoint...");

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/dashboard/metrics").then((res) => res.json()),
      fetch("/api/v1/dashboard/pipeline-timeline").then((res) => res.json()),
      fetch("/api/v1/cloud/metadata").then((res) => res.text()),
      fetch("/api/v1/pipeline/cached-error").then((res) => res.text())
    ])
      .then(([metricsData, timelineData, metadataData, cachedData]) => {
        setMetrics(metricsData);
        setTimeline(timelineData);
        setMetadataPreview(metadataData);
        setCachedErrorPreview(cachedData);
      })
      .catch(() => {
        setMetadataPreview("Metadata endpoint unreachable.");
        setCachedErrorPreview("Cached error endpoint unreachable.");
      });
  }, []);

  const metricValues = useMemo(
    () => ({
      activeNodes: metrics.activeNodes,
      failedJobs: metrics.failedJobs,
      deploySuccessRate: metrics.deploySuccessRate,
      incidentCount: metrics.incidentCount
    }),
    [metrics]
  );

  return (
    <div className="min-h-screen bg-[#0b0e14] flex justify-center">
      <div className="max-w-[1440px] w-full mx-auto px-6 py-6 space-y-6">
        <header className="rounded-2xl border border-[#20283d] bg-[#111827] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Cloud Infrastructure & CI/CD Fault Console</h1>
            <p className="text-sm text-slate-400">Port 9033 Demo · Intentional infrastructure misconfiguration lab</p>
          </div>
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldAlert className="h-4 w-4" />
            <span className="text-sm">Fault simulation active</span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.key} className="rounded-xl border border-[#1f2940] bg-[#0f1726] p-4">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-sm">{card.label}</span>
                  <Icon className="h-4 w-4" />
                </div>
                <p className={cn("mt-2 text-3xl font-semibold", card.key === "failedJobs" ? "text-rose-400" : "text-cyan-300")}>
                  {metricValues[card.key]}
                </p>
              </article>
            );
          })}
        </section>

        <section className="rounded-2xl border border-[#1f2940] bg-[#0f1726] p-5">
          <div className="mb-4 flex items-center gap-2 text-slate-200">
            <Activity className="h-4 w-4" />
            <h2 className="text-lg font-medium">Pipeline Timeline</h2>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b364d" />
                <XAxis dataKey="stage" stroke="#93a4c8" />
                <YAxis stroke="#93a4c8" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #2b364d" }} />
                <Legend />
                <Line type="monotone" dataKey="latency" stroke="#22d3ee" strokeWidth={2} />
                <Line type="monotone" dataKey="errors" stroke="#fb7185" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#1f2940] bg-[#0f1726] p-4">
            <h3 className="text-slate-200 font-medium mb-2">Cloud Metadata (IMDSv1-like)</h3>
            <pre className="max-h-52 overflow-auto whitespace-pre-wrap text-xs text-slate-300 bg-[#0b1220] border border-[#25304a] rounded-lg p-3">
              {metadataPreview}
            </pre>
          </article>
          <article className="rounded-2xl border border-[#1f2940] bg-[#0f1726] p-4">
            <h3 className="text-slate-200 font-medium mb-2">Cached Error Payload</h3>
            <pre className="max-h-52 overflow-auto whitespace-pre-wrap text-xs text-slate-300 bg-[#0b1220] border border-[#25304a] rounded-lg p-3">
              {cachedErrorPreview}
            </pre>
          </article>
        </section>

        <section className="rounded-2xl border border-[#312022] bg-[#140f14] p-4">
          <h2 className="mb-3 text-lg font-medium text-rose-300">Deployment Logs</h2>
          <div className="space-y-2 max-h-56 overflow-auto">
            {leakedLogs.map((line) => (
              <p key={line} className="font-mono text-xs text-rose-200">
                {line}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
