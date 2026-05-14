const express = require('express');
const path = require('path');
const app = express();
const PORT = 9302;

app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const accessories = [
  {
    id: 'a001',
    name: 'Eternal Rose Gold Necklace',
    category: 'Necklaces',
    material: '18K Rose Gold',
    color: 'Rose Gold',
    price: 450,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
    giftWrap: true,
    isGiftRecommended: true
  },
  {
    id: 'a002',
    name: 'Diamond Stud Earrings',
    category: 'Earrings',
    material: 'Platinum',
    color: 'Silver',
    price: 890,
    image: 'https://images.unsplash.com/photo-1535633302704-b02f4faad767?w=600&h=600&fit=crop',
    giftWrap: true,
    isGiftRecommended: true
  },
  {
    id: 'a003',
    name: 'Midnight Pearl Bracelet',
    category: 'Bracelets',
    material: 'Sterling Silver',
    color: 'Silver',
    price: 320,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop',
    giftWrap: false,
    isGiftRecommended: false
  },
  {
    id: 'a004',
    name: 'Celestial Diamond Ring',
    category: 'Rings',
    material: '14K Yellow Gold',
    color: 'Gold',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
    giftWrap: true,
    isGiftRecommended: true // Bug target session for no-response button
  },
  {
    id: 'a005',
    name: 'Minimalist Cuff Earrings',
    category: 'Earrings',
    material: '18K Rose Gold',
    color: 'Rose Gold',
    price: 150,
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&h=600&fit=crop',
    giftWrap: true,
    isGiftRecommended: false
  },
  {
    id: 'a006',
    name: 'Infinity Knot Ring',
    category: 'Rings',
    material: 'Sterling Silver',
    color: 'Silver',
    price: 210,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&h=600&fit=crop',
    giftWrap: true,
    isGiftRecommended: true
  }
];

const collections = [
  {
    id: 'c001',
    name: 'Petals & Pearls',
    description: 'Inspired by the delicate beauty of spring flowers and classic pearls.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=400&fit=crop'
  },
  {
    id: 'c002',
    name: 'Lunar Minimalist',
    description: 'Sleek designs reflecting the quiet strength of the night sky.',
    image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cf4?w=800&h=400&fit=crop'
  }
];

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/accessories', (req, res) => {
  res.json(accessories);
});

app.get('/api/collections', (req, res) => {
  res.json(collections);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
