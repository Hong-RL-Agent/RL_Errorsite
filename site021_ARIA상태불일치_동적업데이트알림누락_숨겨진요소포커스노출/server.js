const express = require('express');
const path = require('path');
const app = express();
const PORT = 9240;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const products = [
  {
    id: 1,
    name: "UltraBook Pro 14",
    brand: "TechMaster",
    category: "Laptops",
    price: 1450000,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    rating: 4.8,
    specs: "Core i7, 16GB RAM, 512GB SSD",
    stock: "In Stock"
  },
  {
    id: 2,
    name: "PixelView 27-inch Monitor",
    brand: "VisionPlus",
    category: "Monitors",
    price: 380000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
    rating: 4.5,
    specs: "4K UHD, 144Hz, IPS",
    stock: "Low Stock"
  },
  {
    id: 3,
    name: "SoundBlast Wireless Headphones",
    brand: "AudioPro",
    category: "Audio",
    price: 250000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    rating: 4.7,
    specs: "Active Noise Cancelling, 40h Battery",
    stock: "In Stock"
  },
  {
    id: 4,
    name: "Mechanical KeyBoard RGB",
    brand: "GameZone",
    category: "Accessories",
    price: 120000,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=300&fit=crop",
    rating: 4.6,
    specs: "Blue Switch, Aluminum Case",
    stock: "In Stock"
  },
  {
    id: 5,
    name: "NeoPhone Z Flip",
    brand: "TechMaster",
    category: "Phones",
    price: 1200000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    rating: 4.9,
    specs: "Foldable OLED, 120Hz",
    stock: "In Stock"
  }
];

const reviews = [
  {
    id: 1,
    productId: 1,
    summary: "Excellent performance and build quality.",
    rating: 5,
    date: "2023-10-25",
    recommendations: 12
  },
  {
    id: 2,
    productId: 1,
    summary: "Battery life could be better.",
    rating: 4,
    date: "2023-11-01",
    recommendations: 5
  }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/products', (req, res) => {
  const { brand, maxPrice, search } = req.query;
  let filtered = products;

  if (brand && brand !== 'All') {
    filtered = filtered.filter(p => p.brand === brand);
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
  }
  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  res.json(filtered);
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
