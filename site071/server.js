const express = require('express');
const path = require('path');
const app = express();
const PORT = 9290;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Mock Data
const glasses = [
  {
    id: 'G001',
    name: 'Neo Classic',
    type: 'Square',
    material: 'Acetate',
    color: 'Obsidian Black',
    price: 185000,
    image: 'assets/glasses-1.jpg',
    recommended: true,
    category: 'Eyeglasses'
  },
  {
    id: 'G002',
    name: 'Aura Round',
    type: 'Round',
    material: 'Titanium',
    color: 'Champagne Gold',
    price: 210000,
    image: 'assets/glasses-2.jpg',
    recommended: false,
    category: 'Eyeglasses'
  },
  {
    id: 'G003',
    name: 'Urban Edge',
    type: 'Aviator',
    material: 'Stainless Steel',
    color: 'Silver Mist',
    price: 195000,
    image: 'assets/glasses-3.jpg',
    recommended: true,
    category: 'Sunglasses'
  },
  {
    id: 'G004',
    name: 'Minimalist Slim',
    type: 'Rectangle',
    material: 'Titanium',
    color: 'Sand Beige',
    price: 245000,
    image: 'assets/glasses-4.jpg',
    recommended: false,
    category: 'Eyeglasses'
  },
  {
    id: 'G005',
    name: 'Bold Horizon',
    type: 'Wayfarer',
    material: 'Acetate',
    color: 'Tortoise Shell',
    price: 175000,
    image: 'assets/glasses-5.jpg',
    recommended: false,
    category: 'Sunglasses'
  },
  {
    id: 'G006',
    name: 'Zenith Float',
    type: 'Rimless',
    material: 'Titanium',
    color: 'Gunmetal',
    price: 280000,
    image: 'assets/glasses-6.jpg',
    recommended: true,
    category: 'Eyeglasses'
  }
];

const lensOptions = [
  {
    id: 'L001',
    name: 'Basic Clear',
    description: 'Standard transparent lenses with anti-reflective coating.',
    extraPrice: 0,
    recommended: false
  },
  {
    id: 'L002',
    name: 'Blue Light Cut',
    description: 'Filters out digital blue light to reduce eye strain.',
    extraPrice: 30000,
    recommended: true
  },
  {
    id: 'L003',
    name: 'High Index 1.67',
    description: 'Thinner and lighter lenses for high prescriptions.',
    extraPrice: 50000,
    recommended: false
  },
  {
    id: 'L004',
    name: 'Photochromic',
    description: 'Transitions from clear to dark in sunlight.',
    extraPrice: 80000,
    recommended: false
  }
];

// API Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Visionary API is healthy' });
});

app.get('/api/glasses', (req, res) => {
  res.json(glasses);
});

app.get('/api/lens-options', (req, res) => {
  res.json(lensOptions);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
