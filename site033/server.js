import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 9252;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const rankings = [
  { rank: 1, player: "Vanta", team: "Nebula Core", score: 9820, winRate: 72.4, recent: "W-W-L-W-W", tier: "Radiant" },
  { rank: 2, player: "Kairo", team: "Seoul Phantoms", score: 9560, winRate: 69.8, recent: "W-L-W-W-W", tier: "Radiant" },
  { rank: 3, player: "Nyx", team: "Pulse Arena", score: 9315, winRate: 68.1, recent: "L-W-W-W-L", tier: "Grandmaster" },
  { rank: 4, player: "Rift", team: "Orion Five", score: 9180, winRate: 66.9, recent: "W-W-W-L-L", tier: "Grandmaster" },
  { rank: 5, player: "Echo", team: "Busan Breakers", score: 8940, winRate: 64.7, recent: "W-L-W-L-W", tier: "Master" },
  { rank: 6, player: "Lumen", team: "Apex Rail", score: 8715, winRate: 63.2, recent: "L-W-W-L-W", tier: "Master" }
];

const matches = [
  { id: "match-001", teams: "Nebula Core vs Pulse Arena", result: "2 : 1", time: "2026-05-02 20:00", map: "Fracture" },
  { id: "match-002", teams: "Seoul Phantoms vs Orion Five", result: "0 : 2", time: "2026-05-02 18:30", map: "Haven" },
  { id: "match-003", teams: "Busan Breakers vs Apex Rail", result: "2 : 0", time: "2026-05-01 21:00", map: "Lotus" },
  { id: "match-004", teams: "Nebula Core vs Orion Five", result: "1 : 2", time: "2026-05-01 19:00", map: "Bind" }
];

app.get("/api/health", (req, res) => {
  res.json({ ok: true, site: "site033", service: "NexusRank", port: PORT });
});

app.get("/api/rankings", (req, res) => {
  res.json({ rankings });
});

app.get("/api/matches", (req, res) => {
  res.json({ matches });
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("/assets/*", (req, res) => {
  res.status(404).type("text/plain").send("Asset not found. Refresh the page to load the latest bundle.");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`site033 NexusRank running at http://localhost:${PORT}`);
});
