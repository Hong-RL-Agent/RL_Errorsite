const express = require('express');
const path = require('path');
const app = express();
const PORT = 9244;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const restaurants = [
  { id: 1, name: "Burger King Premium", category: "Fast Food", rating: 4.5, time: "20-30 min", fee: "2,000원", minOrder: "12,000원", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop" },
  { id: 2, name: "Pizza Al Volo", category: "Pizza", rating: 4.8, time: "30-45 min", fee: "3,000원", minOrder: "18,000원", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop" },
  { id: 3, name: "Sushi Haru", category: "Japanese", rating: 4.7, time: "25-40 min", fee: "2,500원", minOrder: "20,000원", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop" },
  { id: 4, name: "Taco Bell", category: "Mexican", rating: 4.3, time: "15-25 min", fee: "1,500원", minOrder: "10,000원", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
  { id: 5, name: "Gorae Sushi", category: "Japanese", rating: 4.6, time: "30-40 min", fee: "2,000원", minOrder: "15,000원", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop" }
];

const menus = [
  { id: 101, restaurantId: 1, name: "Whopper Premium Set", price: 15000, popular: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop" },
  { id: 102, restaurantId: 1, name: "Chicken Crisp Burger", price: 7500, popular: false, image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=300&h=300&fit=crop" },
  { id: 201, restaurantId: 2, name: "Half & Half Pizza", price: 24000, popular: true, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=300&fit=crop" },
  { id: 301, restaurantId: 3, name: "Special Sushi Set (12pcs)", price: 28000, popular: true, image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=300&h=300&fit=crop" }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/restaurants', (req, res) => {
  const { category, search, minRating } = req.query;
  let filtered = restaurants;
  if (category && category !== 'All') {
    filtered = filtered.filter(r => r.category === category);
  }
  if (search) {
    filtered = filtered.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  }
  if (minRating) {
    filtered = filtered.filter(r => r.rating >= parseFloat(minRating));
  }
  res.json(filtered);
});

app.get('/api/menus', (req, res) => {
  const { restaurantId } = req.query;
  if (restaurantId) {
    res.json(menus.filter(m => m.restaurantId == restaurantId));
  } else {
    res.json(menus);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
