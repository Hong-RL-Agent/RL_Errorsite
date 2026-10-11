const { db } = require('../db/database');

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function photoSvg(name) {
  const h = hash(name);
  const h1 = h % 360;
  const h2 = (h1 + 50 + ((h >>> 9) % 90)) % 360;
  let shapes = '';
  for (let i = 0; i < 6; i += 1) {
    const s = hash(`${name}:${i}`);
    const cx = s % 600;
    const cy = (s >>> 10) % 600;
    const r = 50 + ((s >>> 20) % 150);
    const hue = (h1 + (s % 90)) % 360;
    shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(${hue} 80% 78%)" opacity="0.45"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h1} 85% 82%)"/><stop offset="1" stop-color="hsl(${h2} 80% 70%)"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/>${shapes}</svg>`;
}

function avatarSvg(name) {
  const id = Number(name.replace('avatar-', ''));
  const row = db.prepare('SELECT display_name FROM users WHERE id = ?').get(id);
  const initial = row ? row.display_name.charAt(0) : '?';
  const h1 = hash(name) % 360;
  const h2 = (h1 + 60) % 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h1} 80% 72%)"/><stop offset="1" stop-color="hsl(${h2} 75% 62%)"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="46" font-weight="700" fill="#fff">${initial}</text></svg>`;
}

exports.sendImage = (req, res) => {
  const name = String(req.params.name || '').replace(/[^a-z0-9-]/gi, '');
  const svg = name.startsWith('avatar-') ? avatarSvg(name) : photoSvg(name);
  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(svg);
};
