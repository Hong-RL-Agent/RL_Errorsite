const express = require('express');
const path = require('path');
const app = express();
const PORT = 9306;

app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const bakeryItems = [
  {
    id: 'b001',
    name: 'Sourdough Country Bread',
    type: 'Bread',
    price: 6500,
    allergyTags: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?w=600&h=600&fit=crop',
    isPickupAvailable: true,
    isBest: true
  },
  {
    id: 'b002',
    name: 'Butter Croissant',
    type: 'Pastry',
    price: 3800,
    allergyTags: ['Gluten', 'Dairy'],
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=600&fit=crop',
    isPickupAvailable: true,
    isBest: true
  },
  {
    id: 'b003',
    name: 'Strawberry Shortcake',
    type: 'Cake',
    price: 32000,
    allergyTags: ['Gluten', 'Dairy', 'Egg'],
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=600&fit=crop',
    isPickupAvailable: true,
    isBest: false
  },
  {
    id: 'b004',
    name: 'Chocolate Lava Season Cake',
    type: 'Cake',
    price: 45000,
    allergyTags: ['Gluten', 'Dairy', 'Egg'],
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=600&fit=crop',
    isPickupAvailable: true,
    isBest: true // Bug target for no-response button
  },
  {
    id: 'b005',
    name: 'Walnut Rye Bread',
    type: 'Bread',
    price: 7200,
    allergyTags: ['Gluten', 'Nuts'],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop',
    isPickupAvailable: true,
    isBest: false // Bug target for missing allergy tag
  },
  {
    id: 'b006',
    name: 'Sea Salt Baguette',
    type: 'Bread',
    price: 4200,
    allergyTags: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=600&h=600&fit=crop',
    isPickupAvailable: false,
    isBest: false
  }
];

const pickupSlots = [
  { time: '10:00', isAvailable: true, remaining: 5 },
  { time: '11:00', isAvailable: true, remaining: 3 },
  { time: '13:00', isAvailable: false, remaining: 0 },
  { time: '15:00', isAvailable: true, remaining: 10 },
  { time: '17:00', isAvailable: true, remaining: 8 }
];

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/bakery-items', (req, res) => {
  res.json(bakeryItems);
});

app.get('/api/pickup-slots', (req, res) => {
  res.json(pickupSlots);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
