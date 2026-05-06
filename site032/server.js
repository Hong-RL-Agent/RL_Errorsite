import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 9251;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const restaurants = [
  { id: "rest-velour", name: "Velour Table", region: "청담", rating: 4.9, priceRange: "180,000원~", availableTimes: ["18:00", "19:30", "21:00"], signatureMenu: "한우 웰링턴 코스", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=80" },
  { id: "rest-noir", name: "Maison Noir", region: "한남", rating: 4.8, priceRange: "150,000원~", availableTimes: ["17:30", "20:00", "21:30"], signatureMenu: "트러플 테이스팅", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1100&q=80" },
  { id: "rest-gold", name: "Aurum Dining", region: "서촌", rating: 4.7, priceRange: "120,000원~", availableTimes: ["18:30", "19:00", "20:30"], signatureMenu: "캐비아 프렐류드", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1100&q=80" },
  { id: "rest-brown", name: "Brown Cellar", region: "성수", rating: 4.6, priceRange: "95,000원~", availableTimes: ["17:00", "18:30", "20:00"], signatureMenu: "와인 페어링 코스", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=80" },
  { id: "rest-ivory", name: "Ivory Room", region: "광화문", rating: 4.8, priceRange: "135,000원~", availableTimes: ["18:00", "19:00", "21:00"], signatureMenu: "시그니처 프렌치 코스", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1100&q=80" },
  { id: "rest-lumiere", name: "Lumiere Seoul", region: "청담", rating: 4.9, priceRange: "210,000원~", availableTimes: ["18:30", "20:30"], signatureMenu: "셰프 오마카세", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1100&q=80" }
];

const tables = [
  { tableNo: "A1", seats: 2, available: true, position: "window" },
  { tableNo: "A2", seats: 2, available: false, position: "window" },
  { tableNo: "B1", seats: 4, available: true, position: "main" },
  { tableNo: "B2", seats: 4, available: true, position: "main" },
  { tableNo: "C1", seats: 6, available: false, position: "private" },
  { tableNo: "C2", seats: 6, available: true, position: "private" },
  { tableNo: "D1", seats: 8, available: true, position: "chef" },
  { tableNo: "D2", seats: 2, available: true, position: "bar" }
];

app.get("/api/health", (req, res) => {
  res.json({ ok: true, site: "site032", service: "Maison Reserve", port: PORT });
});

app.get("/api/restaurants", (req, res) => {
  res.json({ restaurants });
});

app.get("/api/tables", (req, res) => {
  res.json({ tables });
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("/assets/*", (req, res) => {
  res.status(404).type("text/plain").send("Asset not found. Refresh the page to load the latest bundle.");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`site032 Maison Reserve running at http://localhost:${PORT}`);
});
