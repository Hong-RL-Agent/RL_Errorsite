const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

// Mock In-Memory DB
let mockDB = {
    users: [{ id: 1, name: 'Alex Rivera', role: 'Administrator', theme: 'dark', ui_scaling: 1.2 }],
    tasks: [
        { id: 1, title: 'Quarterly Audit', status: 'completed' },
        { id: 2, title: 'Server Migration', status: 'in-progress' }
    ],
    analytics: [
        { date: '2024-05-01', base: 5000, bonus: 1200 },
        { date: '2024-05-02', base: 4800, bonus: 1100 },
        { date: '2024-05-03', base: 6200, bonus: 1500 }
    ],
    systemStatus: 'healthy'
};

// --- ERROR 1: Data Processing Error (Logic Bug) ---
app.get('/api/analytics/revenue', (req, res) => {
    const tier = req.query.tier || 'standard';
    
    // Intentional Logic Error: if tier is premium, we incorrectly SUBTRACT bonus
    const processedData = mockDB.analytics.map(item => {
        let total = item.base + item.bonus;
        if (tier === 'premium') {
            // Logic Error: subtraction instead of addition
            total = item.base - (item.bonus * 2); 
        }
        return { ...item, total };
    });

    res.json({ success: true, data: processedData, tier });
});

// --- ERROR 2: Asynchronous Race Condition ---
let isWritingTask = false;
app.post('/api/tasks/create', async (req, res) => {
    const { title } = req.body;
    
    // Mimic async DB delay without proper locking
    if (isWritingTask) {
        // Race condition hit: server returns 500 because it can't handle concurrent "writes" to this specific resource
        return res.status(500).json({ error: 'Concurrent write detected in critical section' });
    }

    isWritingTask = true;
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const newTask = { id: mockDB.tasks.length + 1, title, status: 'pending' };
    mockDB.tasks.push(newTask);
    
    isWritingTask = false;
    res.status(201).json(newTask);
});

// --- ERROR 3: State Recovery Error ---
app.post('/api/system/reboot', (req, res) => {
    mockDB.systemStatus = 'rebooting';
    
    // Simulate system "reboot" clearing session state but forgetting to restore one specific property
    const originalSettings = { ...mockDB.users[0] };
    
    setTimeout(() => {
        mockDB.systemStatus = 'healthy';
        // Logic Error: We restore name/role/theme but FORGET to restore 'ui_scaling'
        mockDB.users[0] = {
            id: originalSettings.id,
            name: originalSettings.name,
            role: originalSettings.role,
            theme: originalSettings.theme
            // ui_scaling is lost!
        };
    }, 500);

    res.json({ message: 'System reboot initiated' });
});

app.get('/api/user/settings', (req, res) => {
    // If ui_scaling is missing, the PPO agent should detect a state recovery failure
    res.json(mockDB.users[0]);
});

// --- ERROR 4: API Logic/Server Response Error (Schema Drift) ---
app.get('/api/search', (req, res) => {
    const query = req.query.q || '';
    
    const baseResults = [
        { id: 1, type: 'report', name: 'Annual Growth' },
        { id: 2, type: 'user', name: 'Sarah Connor' }
    ];

    if (query === 'admin_debug') {
        // Schema Drift Error: Returns 200 OK but changes key 'results' to 'data_dump'
        // and removes the 'id' field from items.
        return res.json({
            status: 'success',
            data_dump: baseResults.map(r => ({ type: r.type, name: r.name }))
        });
    }

    res.json({
        status: 'success',
        results: baseResults
    });
});

// Standard Routes
app.get('/api/dashboard/summary', (req, res) => {
    res.json({
        activeUsers: 1240,
        totalRevenue: 45000,
        uptime: '99.99%',
        alerts: 2
    });
});

app.listen(PORT, () => {
    console.log(`Lumina Backend running at http://localhost:${PORT}`);
});
