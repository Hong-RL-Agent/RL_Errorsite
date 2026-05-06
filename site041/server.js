const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 9260;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Subscription Boxes
app.get('/api/subscription-boxes', (req, res) => {
  const boxes = [
    { 
      id: 1, 
      name: 'Lavender Dream Box', 
      category: 'Healing', 
      price: 29900, 
      image: 'https://images.unsplash.com/photo-1595111028557-47e09295558d?auto=format&fit=crop&w=400&h=400',
      itemCount: 5,
      frequency: 'Every Month',
      options: ['Lavender Tea', 'Aroma Candle', 'Sleep Mask']
    },
    { 
      id: 2, 
      name: 'Coffee Lover Kit', 
      category: 'Food', 
      price: 34500, 
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&h=400',
      itemCount: 4,
      frequency: 'Every 2 Weeks',
      options: ['Specialty Beans', 'Drip Bag', 'Coffee Cup']
    },
    { 
      id: 3, 
      name: 'Green Oasis Plant', 
      category: 'Home', 
      price: 19800, 
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&h=400',
      itemCount: 3,
      frequency: 'Every Month',
      options: ['Easy-care Plant', 'Stylish Pot', 'Care Guide']
    },
    { 
      id: 4, 
      name: 'Gourmet Snack Box', 
      category: 'Food', 
      price: 27000, 
      image: 'https://images.unsplash.com/photo-1599490659223-e1539e7694cf?auto=format&fit=crop&w=400&h=400',
      itemCount: 8,
      frequency: 'Every Month',
      options: ['Imported Cookies', 'Healthy Chips', 'Seasonal Tea']
    },
    { 
      id: 5, 
      name: 'Aesthetic Stationery', 
      category: 'Hobby', 
      price: 21000, 
      image: 'https://images.unsplash.com/photo-1583485088034-7160b52ac581?auto=format&fit=crop&w=400&h=400',
      itemCount: 6,
      frequency: 'Every 2 Weeks',
      options: ['Stickers', 'Washi Tape', 'Memo Pad']
    },
    { 
      id: 6, 
      name: 'Minimalist Skincare', 
      category: 'Beauty', 
      price: 42000, 
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&h=400',
      itemCount: 4,
      frequency: 'Every Month',
      options: ['Cleanser', 'Moisturizer', 'Sunscreen']
    }
  ];
  res.json(boxes);
});

// API: Reviews
app.get('/api/reviews', (req, res) => {
  const reviews = [
    { id: 1, boxId: 1, author: '김지우', rating: 5, content: '라벤더 향이 너무 좋아요. 매달 기다려집니다.', date: '2024.01.20' },
    { id: 2, boxId: 2, author: '이준호', rating: 4, content: '신선한 원두를 집에서 즐길 수 있어 만족스러워요.', date: '2024.01.15' },
    { id: 3, boxId: 1, author: '박민지', rating: 5, content: '포장이 너무 예뻐서 선물받는 기분이에요.', date: '2024.01.10' }
  ];
  res.json(reviews);
});

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
