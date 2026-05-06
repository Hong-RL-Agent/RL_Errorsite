const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 9279;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const plants = [
    {
        id: 'p1',
        name: 'Monstera Deliciosa',
        type: 'Indoor',
        lastWatered: '2024-05-01',
        nextWatering: '2024-05-08',
        status: 'Healthy',
        image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=300&fit=crop',
        description: 'Large, heart-shaped leaves with unique holes.'
    },
    {
        id: 'p2',
        name: 'Snake Plant',
        type: 'Succulent',
        lastWatered: '2024-04-20',
        nextWatering: '2024-05-15',
        status: 'Thriving',
        image: 'https://images.unsplash.com/photo-1593482892290-f54927ae1cdc?w=400&h=300&fit=crop',
        description: 'Tough, upright leaves with yellow edges.'
    },
    {
        id: 'p3',
        name: 'Fiddle Leaf Fig',
        type: 'Indoor',
        lastWatered: '2024-05-03',
        nextWatering: '2024-05-10',
        status: 'Needs Attention',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
        description: 'Stunning violin-shaped leaves.'
    },
    {
        id: 'p4',
        name: 'Aloe Vera',
        type: 'Succulent',
        lastWatered: '2024-04-25',
        nextWatering: '2024-05-12',
        status: 'Healthy',
        image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=400&h=300&fit=crop',
        description: 'Medicinal succulent with fleshy leaves.'
    },
    {
        id: 'p5',
        name: 'Peace Lily',
        type: 'Flowering',
        lastWatered: '2024-05-04',
        nextWatering: '2024-05-07',
        status: 'Healthy',
        image: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=400&h=300&fit=crop',
        description: 'Elegant white flowers and dark green foliage.'
    },
    {
        id: 'p6',
        name: 'Spider Plant',
        type: 'Indoor',
        lastWatered: '2024-05-02',
        nextWatering: '2024-05-09',
        status: 'Healthy',
        image: 'https://images.unsplash.com/photo-1545239351-ef35f43d514d?w=400&h=300&fit=crop',
        description: 'Arching leaves with baby plantlets.'
    }
];

const careTasks = [
    { id: 't1', plantId: 'p1', type: 'Watering', dueDate: '2024-05-08', completed: false },
    { id: 't2', plantId: 'p3', type: 'Misting', dueDate: '2024-05-06', completed: false },
    { id: 't3', plantId: 'p2', type: 'Fertilizing', dueDate: '2024-05-15', completed: false },
    { id: 't4', plantId: 'p5', type: 'Watering', dueDate: '2024-05-07', completed: false },
    { id: 't5', plantId: 'p6', type: 'Pruning', dueDate: '2024-05-10', completed: true }
];

// Endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/plants', (req, res) => {
    res.json(plants);
});

app.get('/api/care-tasks', (req, res) => {
    res.json(careTasks);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
