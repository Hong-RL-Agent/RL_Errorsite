import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 9248;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const events = [
  {
    id: "evt-aurora",
    title: "AURORA NEON LIVE 2026",
    venue: "KSPO DOME",
    city: "Seoul",
    date: "2026-05-18",
    genre: "Concert",
    poster: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
    status: "Ticket Open",
    remainingSeats: 128
  },
  {
    id: "evt-pulse",
    title: "PULSE WAVE FESTIVAL",
    venue: "Busan Cinema Center",
    city: "Busan",
    date: "2026-06-02",
    genre: "Festival",
    poster: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=80",
    status: "Selling Fast",
    remainingSeats: 74
  },
  {
    id: "evt-orbit",
    title: "ORBIT SYNTH NIGHT",
    venue: "Incheon Culture Hall",
    city: "Incheon",
    date: "2026-06-11",
    genre: "EDM",
    poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
    status: "Ticket Open",
    remainingSeats: 311
  },
  {
    id: "evt-luna",
    title: "LUNA BALLAD THEATER",
    venue: "Daegu Opera House",
    city: "Daegu",
    date: "2026-06-20",
    genre: "Musical",
    poster: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80",
    status: "Pre-sale",
    remainingSeats: 206
  },
  {
    id: "evt-halo",
    title: "HALO INDIE STAGE",
    venue: "Gwangju Sound Park",
    city: "Gwangju",
    date: "2026-07-04",
    genre: "Indie",
    poster: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    status: "Ticket Open",
    remainingSeats: 49
  },
  {
    id: "evt-nova",
    title: "NOVA CLASSIC POPS",
    venue: "Seoul Arts Center",
    city: "Seoul",
    date: "2026-07-16",
    genre: "Classic",
    poster: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=900&q=80",
    status: "Coming Soon",
    remainingSeats: 420
  }
];

const ticketTiers = [
  {
    id: "vip",
    tierName: "VIP",
    price: 198000,
    seats: 42,
    benefits: ["Front block", "Soundcheck entry", "Collector wristband"],
    color: "#ff2ea6"
  },
  {
    id: "r",
    tierName: "R Seat",
    price: 154000,
    seats: 88,
    benefits: ["Central floor", "Priority gate"],
    color: "#8f5cff"
  },
  {
    id: "standard",
    tierName: "Standard",
    price: 99000,
    seats: 240,
    benefits: ["Reserved seat", "Mobile ticket"],
    color: "#ffffff"
  }
];

app.get("/api/health", (req, res) => {
  res.json({ ok: true, site: "site029", service: "PulseTicket", port: PORT });
});

app.get("/api/events", (req, res) => {
  res.json({ events });
});

app.get("/api/ticket-tiers", (req, res) => {
  res.json({ ticketTiers });
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("/assets/*", (req, res) => {
  res.status(404).type("text/plain").send("Asset not found. Refresh the page to load the latest bundle.");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`site029 PulseTicket running at http://localhost:${PORT}`);
});
