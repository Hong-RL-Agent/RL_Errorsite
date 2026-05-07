import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9137;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock Data
// Chronos Archive - High Fidelity Historical Database
const historyEvents = [
  { id: 1, title: "The Neolithic Revolution", year: -10000, location: "Mesopotamia", description: "The transition of human cultures from hunting and gathering to agriculture and settlement, making possible an increasingly larger population.", popular: true, significance: "Civilization Dawn" },
  { id: 2, title: "Code of Hammurabi", year: -1754, location: "Babylon", description: "One of the oldest deciphered writings of significant length in the world, enacted by the sixth Babylonian king, Hammurabi.", popular: false, significance: "Legal Foundation" },
  { id: 3, title: "Great Pyramid of Giza", year: -2560, location: "Egypt", description: "The oldest and largest of the pyramids in the Giza pyramid complex, a testament to ancient engineering and social organization.", popular: true, significance: "Architectural Wonder" },
  { id: 4, title: "Foundation of Rome", year: -753, location: "Italy", description: "According to legend, Romulus founded the city after killing his twin brother Remus, marking the start of a legendary empire.", popular: true, significance: "Imperial Genesis" },
  { id: 5, title: "The Silk Road Opening", year: -130, location: "Eurasia", description: "A network of trade routes connecting the East and West, central to economic, cultural, and political interactions.", popular: true, significance: "Global Exchange" },
  { id: 6, title: "Invention of the Printing Press", year: 1440, location: "Germany", description: "Johannes Gutenberg's invention started the Printing Revolution, a milestone in the second millennium.", popular: true, significance: "Knowledge Democratization" },
  { id: 7, title: "The French Revolution", year: 1789, location: "France", description: "A period of far-reaching social and political upheaval in France and its colonies beginning in 1789.", popular: true, significance: "Political Shift" },
  { id: 8, title: "Signing of Magna Carta", year: 1215, location: "England", description: "A royal charter of rights agreed to by King John of England, establishing the principle that everyone is subject to the law.", popular: false, significance: "Constitutional Basis" },
  { id: 9, title: "Apollo 11 Moon Landing", year: 1969, location: "The Moon", description: "The spaceflight that first landed humans on the Moon, led by Neil Armstrong and Buzz Aldrin.", popular: true, significance: "Space Exploration" },
  { id: 10, title: "Industrial Revolution", year: 1760, location: "United Kingdom", description: "The transition to new manufacturing processes in Great Britain, continental Europe, and the United States.", popular: true, significance: "Economic Transformation" },
  { id: 11, title: "Discovery of Penicillin", year: 1928, location: "London", description: "Alexander Fleming's accidental discovery of the world's first antibiotic, revolutionizing medicine.", popular: false, significance: "Medical Breakthrough" },
  { id: 12, title: "Fall of the Berlin Wall", year: 1989, location: "Germany", description: "A pivotal event in world history which marked the falling of the Iron Curtain and the start of the fall of communism.", popular: true, significance: "Cold War End" },
  { id: 13, title: "Renaissance Humanism", year: 1400, location: "Italy", description: "A revival in the study of classical antiquity, at first in Italy and then spreading across Western Europe.", popular: true, significance: "Cultural Rebirth" },
  { id: 14, title: "Voyage of Magellan", year: 1519, location: "Global Ocean", description: "The first circumnavigation of the Earth, proving that the world is much larger than previously thought.", popular: false, significance: "Maritime Mastery" },
  { id: 15, title: "The Steam Engine Patent", year: 1769, location: "Scotland", description: "James Watt's improvement of the Newcomen steam engine, fundamental to the Industrial Revolution.", popular: false, significance: "Mechanical Power" },
  { id: 16, title: "Invention of the World Wide Web", year: 1989, location: "Switzerland", description: "Tim Berners-Lee's proposal for an information management system that became the basis for the modern internet.", popular: true, significance: "Digital Age" },
  { id: 17, title: "Declaration of Independence", year: 1776, location: "USA", description: "The pronouncement adopted by the Second Continental Congress meeting in Philadelphia, Pennsylvania.", popular: true, significance: "Modern Democracy" },
  { id: 18, title: "The Crusades", year: 1095, location: "Middle East", description: "A series of religious wars initiated, supported, and sometimes directed by the Latin Church.", popular: false, significance: "Religious Conflict" },
  { id: 19, title: "Black Death Pandemic", year: 1347, location: "Eurasia", description: "The most fatal pandemic recorded in human history, resulting in the deaths of up to 200 million people.", popular: false, significance: "Social Reshaping" },
  { id: 20, title: "Battle of Waterloo", year: 1815, location: "Belgium", description: "The final defeat of Napoleon Bonaparte, marking the end of the Napoleonic Wars.", popular: true, significance: "Military Turning Point" }
];

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: "Chronos Archive Core",
    status: "online",
    archive_version: "v4.2.0-stable",
    timestamp: new Date().toISOString()
  });
});

// 2. GET /api/events (Main Archive & Index)
app.get('/api/events', (req, res) => {
  const { page, limit = 5, cursor } = req.query;

  // Professional Integration of Bug 02: Legacy Index Migration
  // When 'page' is requested, the system attempts to use 'cursor' internally but fails to map correctly
  if (page) {
    return res.json({
      status: "migration_active",
      message: "Legacy pagination detected. Redirecting to cursor-based indexing.",
      cursor: "arch_idx_006_next", // Fixed cursor for simulation
      data: historyEvents.slice(0, 5),
      bugId: "site028-bug02"
    });
  }

  // Professional Integration of Bug 03: Recursive Stream Expansion
  // The next cursor logic is broken, returning null prematurely
  if (cursor) {
    return res.json({
      status: "expansion_fault",
      nextCursor: null, // Intentional Bug 03
      data: historyEvents.slice(5, 10),
      bugId: "site028-bug03"
    });
  }

  // Professional Integration of Bug 01: Digital Forensic Recovery
  // Detailed view exposes internal system metadata
  const results = historyEvents.map(event => ({
    ...event,
    _metadata: {
      archivist_id: `sys_admin_${event.id % 3}`,
      last_audit_log: "RECOVERED_FROM_DAMAGED_SECTOR",
      internal_checksum: "0xDEADBEEF",
      brain_scan_id: `BS-${1000 + event.id}` // Sensitivity leak
    }
  }));

  res.json({
    status: "success",
    data: results,
    total_records: historyEvents.length,
    bugId: "site028-bug01"
  });
});

// 3. GET /api/events/popular (Curated Highlights)
app.get('/api/events/popular', (req, res) => {
  const popular = historyEvents.filter(e => e.popular);
  
  // Professional Integration of Bug 04: Curated Highlight Sequencing
  // The 'Curated' list is supposed to be sorted by Year, but it's shuffled/reversed
  const shuffled = [...popular].sort(() => Math.random() - 0.5);

  res.json({
    status: "partial_sync",
    data: shuffled,
    sort_strategy: "curated_relevance",
    bugId: "site028-bug04"
  });
});

// 4. GET /api/search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ data: [] });
  
  const filtered = historyEvents.filter(e => 
    e.title.toLowerCase().includes(q.toLowerCase()) || 
    e.location.toLowerCase().includes(q.toLowerCase()) ||
    e.significance.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    status: "search_complete",
    query: q,
    count: filtered.length,
    data: filtered
  });
});

// 5. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    total_artifacts: historyEvents.length,
    verified_milestones: historyEvents.filter(e => e.popular).length,
    archive_uptime: "99.98%",
    system_load: "Low",
    data_integrity: "Nominal"
  });
});

// Serve SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Chronos Archive Server active on http://localhost:${PORT}`);
});
