const express = require('express');
const path = require('path');
const app = express();
const PORT = 9309;

app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const departments = [
  { id: 'd001', name: 'Internal Medicine', description: 'Comprehensive care for adult health concerns.', isAvailable: true, doctorCount: 12 },
  { id: 'd002', name: 'Pediatrics', description: 'Specialized healthcare for infants and children.', isAvailable: true, doctorCount: 8 },
  { id: 'd003', name: 'Orthopedics', description: 'Expertise in musculoskeletal system disorders.', isAvailable: true, doctorCount: 10 },
  { id: 'd004', name: 'Cardiology', description: 'Advanced diagnosis and treatment for heart conditions.', isAvailable: true, doctorCount: 6 },
  { id: 'd005', name: 'Dermatology', description: 'Comprehensive skin, hair, and nail treatments.', isAvailable: true, doctorCount: 5 }
];

const doctors = [
  { id: 'dr001', name: 'Dr. John Smith', deptId: 'd001', specialty: 'Gastroenterology', availability: 'Mon-Fri', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop' },
  { id: 'dr002', name: 'Dr. Emily Chen', deptId: 'd001', specialty: 'Endocrinology', availability: 'Tue-Sat', image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?w=200&h=200&fit=crop' },
  { id: 'dr003', name: 'Dr. Michael Brown', deptId: 'd002', specialty: 'Pediatric Allergy', availability: 'Mon-Thu', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop' },
  { id: 'dr004', name: 'Dr. Sarah Wilson', deptId: 'd003', specialty: 'Spine Surgery', availability: 'Wed-Sun', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop' },
  { id: 'dr005', name: 'Dr. Robert Lee', deptId: 'd004', specialty: 'Interventional Cardiology', availability: 'Mon-Fri', image: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=200&h=200&fit=crop' }
];

const notices = [
  { id: 'n001', title: 'Seasonal Flu Vaccination Campaign 2026', date: '2026-04-15', isImportant: true, content: 'Starting April 20th, we are offering seasonal flu vaccinations at the 2nd floor clinic center.' },
  { id: 'n002', title: 'New Specialized Cardiology Center Opening', date: '2026-05-01', isImportant: false, content: 'MediLife Hospital is proud to announce the opening of our state-of-the-art Cardiology Center.' },
  { id: 'n003', title: 'Holiday Operations Notice (May 5th)', date: '2026-05-03', isImportant: true, content: 'The outpatient clinic will be closed on Children\'s Day. The ER will remain open 24/7.' }
];

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/departments', (req, res) => {
  res.json(departments);
});

app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

app.get('/api/notices', (req, res) => {
  res.json(notices);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
