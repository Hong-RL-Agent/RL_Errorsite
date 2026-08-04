const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 9259;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Spa Packages
app.get('/api/spa-packages', (req, res) => {
  const packages = [
    { 
      id: 1, 
      name: 'Signature Royal Massage', 
      category: 'Massage', 
      duration: '90 min', 
      price: 280000, 
      recommended: true,
      image: 'https://images.unsplash.com/photo-1544161515-4ae6b91838d2?auto=format&fit=crop&w=400&h=300',
      description: 'A luxurious full-body treatment using gold-infused oils for ultimate relaxation.',
      // Bug 01 source: addOnLabel is missing for this package
    },
    { 
      id: 2, 
      name: 'Deep Sea Facial', 
      category: 'Facial', 
      duration: '60 min', 
      price: 180000, 
      recommended: false,
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&h=300',
      description: 'Mineral-rich treatment using marine extracts to revitalize your skin.',
      addOnLabel: 'Aroma Oil Included'
    },
    { 
      id: 3, 
      name: 'Zen Body Scrub', 
      category: 'Body', 
      duration: '45 min', 
      price: 120000, 
      recommended: true,
      image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=400&h=300',
      description: 'Natural sea salt scrub to gently exfoliate and brighten the skin.',
      addOnLabel: 'Herbal Tea Service'
    },
    { 
      id: 4, 
      name: 'Aromatherapy Escape', 
      category: 'Massage', 
      duration: '60 min', 
      price: 220000, 
      recommended: false,
      image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=400&h=300',
      description: 'Customized essential oil blend to harmonize your body and mind.',
      addOnLabel: 'Hot Stone Add-on'
    },
    { 
      id: 5, 
      name: 'Hydrotherapy Soak', 
      category: 'Water', 
      duration: '30 min', 
      price: 80000, 
      recommended: false,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&h=300',
      description: 'Mineral bath experience with hydro-jets for muscle relief.',
      addOnLabel: 'Complimentary Juice'
    }
  ];
  res.json(packages);
});

// API: Therapists
app.get('/api/therapists', (req, res) => {
  const therapists = [
    { 
      id: 101, 
      name: 'Elena Park', 
      specialty: 'Swedish Massage', 
      rating: 4.9, 
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150',
      availableTimes: ['10:00', '13:00', '15:00', '17:00']
    },
    { 
      id: 102, 
      name: 'Marcus Kim', 
      specialty: 'Deep Tissue', 
      rating: 4.8, 
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150',
      availableTimes: ['11:00', '14:00', '16:00', '18:00']
    },
    { 
      id: 103, 
      name: 'Sarah Lee', 
      specialty: 'Clinical Facial', 
      rating: 5.0, 
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
      availableTimes: ['10:00', '12:00', '14:00', '15:30']
    }
  ];
  res.json(therapists);
});

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
