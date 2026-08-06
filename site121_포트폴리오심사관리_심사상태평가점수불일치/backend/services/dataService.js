import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/data.json');

export const readDB = () => {
  try { return JSON.parse(fs.readFileSync(dbPath, 'utf8')); }
  catch (e) { console.error('Error reading data.json:', e); return {}; }
};

export const writeDB = (data) => {
  try { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8'); }
  catch (e) { console.error('Error writing data.json:', e); }
};
