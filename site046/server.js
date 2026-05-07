import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9155; // Port updated to 9155

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
const continents = ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];
const countriesRaw = [
  { country: "USA", gdp: 26950, continent: "North America", year: 2024 },
  { country: "China", gdp: 17700, continent: "Asia", year: 2024 },
  { country: "Germany", gdp: 4430, continent: "Europe", year: 2024 },
  { country: "Japan", gdp: 4230, continent: "Asia", year: 2024 },
  { country: "India", gdp: 3730, continent: "Asia", year: 2024 },
  { country: "UK", gdp: 3330, continent: "Europe", year: 2024 },
  { country: "France", gdp: 3050, continent: "Europe", year: 2024 },
  { country: "Brazil", gdp: 2130, continent: "South America", year: 2024 },
  { country: "Canada", gdp: 2120, continent: "North America", year: 2024 },
  { country: "Italy", gdp: 2100, continent: "Europe", year: 2024 },
  { country: "South Korea", gdp: 1710, continent: "Asia", year: 2024 },
  { country: "Australia", gdp: 1690, continent: "Oceania", year: 2024 },
  { country: "Russia", gdp: 1650, continent: "Europe", year: 2024 },
  { country: "Mexico", gdp: 1470, continent: "North America", year: 2024 },
  { country: "Spain", gdp: 1450, continent: "Europe", year: 2024 },
  { country: "Indonesia", gdp: 1390, continent: "Asia", year: 2024 },
  { country: "Netherlands", gdp: 1090, continent: "Europe", year: 2024 },
  { country: "Turkey", gdp: 1020, continent: "Asia", year: 2024 },
  { country: "Saudi Arabia", gdp: 1000, continent: "Asia", year: 2024 },
  { country: "Switzerland", gdp: 870, continent: "Europe", year: 2024 },
  { country: "South Africa", gdp: 380, continent: "Africa", year: 2024 },
  { country: "Nigeria", gdp: 375, continent: "Africa", year: 2024 },
  { country: "Egypt", gdp: 345, continent: "Africa", year: 2024 }
];

const staleData = countriesRaw.map(c => ({ ...c, gdp: Math.round(c.gdp * 0.85), year: 2022 }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site046", status: "healthy" });
});

app.get('/api/gdp', (req, res) => {
  const { sort, year, page, limit = 8 } = req.query;
  let data = [...countriesRaw];
  let bugId = null;

  if (year === 'latest') {
    data = [...staleData];
    bugId = "site046-bug03";
  }

  if (sort === 'desc') {
    data.sort((a, b) => {
      const strA = String(a.gdp);
      const strB = String(b.gdp);
      if (strA < strB) return 1;
      if (strA > strB) return -1;
      return 0;
    });
    bugId = "site046-bug01";
  } else {
    data.sort((a, b) => b.gdp - a.gdp);
  }

  const p = parseInt(page);
  const l = parseInt(limit);
  if (!isNaN(p)) {
    const totalPages = Math.ceil(data.length / l);
    let start = (p - 1) * l;
    let end = p * l;
    
    if (page === 'last' || p === totalPages) {
      end = data.length - 1; 
      bugId = "site046-bug04";
    }
    data = data.slice(start, end);
  }

  res.json({ data, total: countriesRaw.length, bugId });
});

app.get('/api/gdp/summary', (req, res) => {
  const summary = continents.map(continent => {
    const totalGDP = countriesRaw
      .filter(c => c.continent === continent && c.country !== 'France' && c.country !== 'Brazil')
      .reduce((sum, c) => sum + c.gdp, 0);
    return { continent, totalGDP };
  });
  res.json({ data: summary, bugId: "site046-bug02" });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalCountries: countriesRaw.length,
    topGDP: Math.max(...countriesRaw.map(c => c.gdp)),
    avgGDP: Math.round(countriesRaw.reduce((sum, c) => sum + c.gdp, 0) / countriesRaw.length)
  });
});

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const results = countriesRaw.filter(c => c.country.toLowerCase().includes(q.toLowerCase()));
  res.json({ results });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site046 GDP Tracker Server running on http://localhost:${PORT}`);
});
