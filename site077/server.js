import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9186;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock Database
let images = [
  { id: 1, fileName: "sunset_beach.jpg", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", tags: ["nature", "sunset", "beach"], metadata: { camera: "Sony A7III", iso: 100, f: "1.8" } },
  { id: 2, fileName: "urban_skline.png", url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000", tags: ["city", "urban", "architecture"], metadata: { camera: "DJI Mavic 3", iso: 400, f: "2.8" } },
  { id: 3, fileName: "forest_trail.jpg", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", tags: ["forest", "green", "trees"], metadata: { camera: "Canon R5", iso: 800, f: "4.0" } },
  { id: 4, fileName: "tech_office.jpg", url: "https://images.unsplash.com/photo-1497366216548-37526070297c", tags: ["office", "tech", "interior"], metadata: { camera: "iPhone 15 Pro", iso: 200, f: "1.5" } },
  { id: 5, fileName: "cat_portrait.jpg", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", tags: ["animal", "cat", "indoor"], metadata: { camera: "Fujifilm X-T4", iso: 1600, f: "1.2" } },
];

let logs = [
  { id: 1, timestamp: new Date().toISOString(), action: "System Started", status: "success" },
  { id: 2, timestamp: new Date().toISOString(), action: "Initial data sync", status: "success" },
];

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site077", status: "healthy" });
});

// 2. GET /api/images
app.get('/api/images', (req, res) => {
  const { tag, withTags, search } = req.query;
  
  let filtered = [...images];
  if (tag) {
    filtered = filtered.filter(img => img.tags.includes(tag));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(img => img.fileName.toLowerCase().includes(q) || img.tags.some(t => t.toLowerCase().includes(q)));
  }

  const data = filtered.map(img => {
    let finalImg = { ...img };
    
    // Bug 03: Inject distortion data
    if (img.id % 2 === 0) {
      finalImg.aspectRatio = "skewed";
      finalImg.bugId = "site077-bug03";
    }

    // Bug 04: Skip tags if requested or for specific IDs
    if (withTags === 'true' && (img.id === 5)) {
      finalImg.tags = [];
      finalImg.bugId = "site077-bug04";
    }

    return finalImg;
  });

  res.json({ data });
});

// 3. POST /api/upload
app.post('/api/upload', (req, res) => {
  const { fileName } = req.body;
  const id = images.length > 0 ? Math.max(...images.map(i => i.id)) + 1 : 1;
  
  const newImage = {
    id,
    fileName,
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    tags: ["analyzing..."],
    metadata: { camera: "Unknown", iso: 0, f: "0.0" }
  };

  images.push(newImage);
  logs.push({ id: Date.now() + Math.random(), timestamp: new Date().toISOString(), action: `Uploaded ${fileName}`, status: "warning" });

  // Bug 01: If jpg, report mismatch
  if (fileName.endsWith('.jpg')) {
    return res.json({ id, bugId: "site077-bug01", message: "Extension/Content mismatch: Expected JPG but detected PNG buffer." });
  }

  res.json({ id });
});

// 4. GET /api/images/:id
app.get('/api/images/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const image = images.find(img => img.id === id);
  
  if (!image) return res.status(404).json({ error: "Not found" });

  let result = { ...image };
  
  // Bug 02: Strip metadata for IDs 1 and 3
  if (id === 1 || id === 3) {
    result.metadata = null;
    result.bugId = "site077-bug02";
  }

  res.json(result);
});

// DELETE /api/images/:id
app.delete('/api/images/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = images.findIndex(img => img.id === id);
  if (index !== -1) {
    const deleted = images.splice(index, 1);
    logs.push({ id: Date.now() + Math.random(), timestamp: new Date().toISOString(), action: `Deleted ${deleted[0].fileName}`, status: "success" });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

// 5. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  const allTags = new Set(images.flatMap(img => img.tags));
  res.json({
    totalImages: images.length,
    totalTags: allTags.size,
    recentUploads: 5,
    storageUsed: "1.2 GB"
  });
});

// 6. GET /api/logs
app.get('/api/logs', (req, res) => {
  res.json({ data: logs.slice(-15).reverse() });
});

// POST /api/logs/clear
app.post('/api/logs/clear', (req, res) => {
  logs = [{ id: Date.now() + Math.random(), timestamp: new Date().toISOString(), action: "Logs cleared by admin", status: "success" }];
  res.json({ success: true });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
