/**
 * LUMINA ANALYTICS - VIRTUAL BACKEND & FRONTEND LOGIC
 * Designed for PPO Agent Training on Logic Errors.
 */

// --- VIRTUAL BACKEND (The "Black Box" for PPO Training) ---
class VirtualBackend {
    constructor() {
        this.db = {
            users: [{ id: 1, name: 'Alex Rivera', role: 'Administrator', theme: 'dark', ui_scaling: 1.2 }],
            tasks: [
                { id: 1, title: 'Quarterly Audit', status: 'completed' },
                { id: 2, title: 'Server Migration', status: 'in-progress' }
            ],
            analytics: [
                { date: '2024-05-01', base: 5000, bonus: 1200 },
                { date: '2024-05-02', base: 4800, bonus: 1100 },
                { date: '2024-05-03', base: 6200, bonus: 1500 },
                { date: '2024-05-04', base: 5500, bonus: 1300 },
                { date: '2024-05-05', base: 7000, bonus: 1800 }
            ],
            systemStatus: 'healthy'
        };
        this.isWritingTask = false;
    }

    // --- ERROR 1: Data Processing Error (Logic Bug) ---
    async getRevenue(tier = 'standard') {
        await this.simulateLatency(200);
        const data = this.db.analytics.map(item => {
            let total = item.base + item.bonus;
            if (tier === 'premium') {
                // INTENTIONAL ERROR: Subtraction instead of addition
                total = item.base - (item.bonus * 2.5); 
            }
            return { ...item, total };
        });
        return { success: true, data, tier };
    }

    // --- ERROR 2: Asynchronous Race Condition ---
    async createTask(title) {
        if (this.isWritingTask) {
            await this.simulateLatency(50);
            throw new Error('Concurrent write detected in critical section');
        }

        this.isWritingTask = true;
        await this.simulateLatency(300);
        
        const newTask = { id: this.db.tasks.length + 1, title, status: 'pending' };
        this.db.tasks.push(newTask);
        
        this.isWritingTask = false;
        return newTask;
    }

    // --- ERROR 3: State Recovery Error ---
    async rebootSystem() {
        this.db.systemStatus = 'rebooting';
        const originalScaling = this.db.users[0].ui_scaling;
        
        // Wipe session
        this.db.users[0].ui_scaling = undefined; 

        await this.simulateLatency(800);
        
        // INTENTIONAL ERROR: We "forget" to restore ui_scaling after reboot
        this.db.systemStatus = 'healthy';
        return { message: 'System reboot complete' };
    }

    async getUserSettings() {
        await this.simulateLatency(100);
        return this.db.users[0];
    }

    // --- ERROR 4: API Logic/Schema Drift ---
    async search(query) {
        await this.simulateLatency(400);
        const baseResults = [
            { id: 101, type: 'report', name: 'Annual Growth' },
            { id: 102, type: 'user', name: 'Sarah Connor' },
            { id: 103, type: 'metric', name: 'Churn Rate' }
        ];

        if (query === 'admin_debug') {
            // INTENTIONAL ERROR: Returns 200 OK but mutates schema
            return {
                status: 'success',
                data_dump: baseResults.map(r => ({ type: r.type, name: r.name })) // MISSING 'id' and 'results' key
            };
        }

        return {
            status: 'success',
            results: baseResults
        };
    }

    async getSummary() {
        return {
            activeUsers: 1240,
            totalRevenue: 45000,
            uptime: '99.99%',
            alerts: 2
        };
    }

    simulateLatency(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const API = new VirtualBackend();

// --- FRONTEND LOGIC ---

let currentTier = 'standard';
let revenueChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    await updateDashboard();
    await updateRevenueChart();
    await updateUserSettings();
    setupEvents();
}

async function updateDashboard() {
    const data = await API.getSummary();
    document.getElementById('stat-users').innerText = data.activeUsers.toLocaleString();
    document.getElementById('stat-revenue').innerText = `$${data.totalRevenue.toLocaleString()}`;
    document.getElementById('stat-uptime').innerText = data.uptime;
    document.getElementById('stat-alerts').innerText = data.alerts;
}

async function updateUserSettings() {
    const user = await API.getUserSettings();
    document.getElementById('user-display-name').innerText = user.name;

    // ERROR DETECTION POINT: State Recovery
    if (user.ui_scaling === undefined) {
        console.error('[CRITICAL] State Recovery Error: ui_scaling property missing after reboot.');
        showToast('UI Scaling state lost!', 'danger');
    } else {
        // In a real app, this might change the layout size
        console.log(`UI Scaling applied: ${user.ui_scaling}`);
    }
}

async function updateRevenueChart() {
    const result = await API.getRevenue(currentTier);
    const ctx = document.getElementById('revenueChart').getContext('2d');

    // ERROR DETECTION POINT: Logic Bug
    if (result.data.some(d => d.total < 0)) {
        console.warn('[LOGIC ERROR] Negative revenue values detected in Premium tier.');
        showToast('Analytics processing error!', 'warning');
    }

    const chartData = {
        labels: result.data.map(d => d.date),
        datasets: [{
            label: `Revenue (${currentTier})`,
            data: result.data.map(d => d.total),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

async function handleSearch(query) {
    switchView('search');
    const container = document.getElementById('search-results');
    container.innerHTML = '<div class="loading">Searching...</div>';

    const data = await API.search(query);

    // ERROR DETECTION POINT: Schema Drift
    let results = data.results;
    if (!results && data.data_dump) {
        console.error('[API ERROR] Schema Drift: Expected "results" but found "data_dump".');
        results = data.data_dump;
        showToast('API Schema Mismatch', 'warning');
    }

    if (!results || results.length === 0) {
        container.innerHTML = '<p>No results found.</p>';
        return;
    }

    container.innerHTML = results.map(item => `
        <div class="result-card">
            <h3>${item.name}</h3>
            <p>Type: ${item.type} | ID: ${item.id || 'ERR_UNDEFINED'}</p>
        </div>
    `).join('');
}

async function createNewTask(title) {
    try {
        await API.createTask(title);
        showToast('Task Created', 'success');
    } catch (err) {
        // ERROR DETECTION POINT: Async Race
        console.error(`[SERVER ERROR] ${err.message}`);
        showToast(err.message, 'danger');
    }
}

function setupEvents() {
    // Nav
    document.getElementById('nav-dashboard').onclick = () => switchView('dashboard');
    document.getElementById('nav-tasks').onclick = () => switchView('tasks');
    
    // Revenue Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTier = e.target.dataset.tier;
            updateRevenueChart();
        };
    });

    // Search
    document.getElementById('global-search').onkeypress = (e) => {
        if (e.key === 'Enter') handleSearch(e.target.value);
    };

    // Race Condition Trigger
    document.getElementById('action-add-task').onclick = () => {
        createNewTask('System Check A');
        createNewTask('System Check B');
        createNewTask('System Check C');
    };

    // State Recovery Trigger
    document.getElementById('action-reboot').onclick = async () => {
        showToast('Rebooting...', 'warning');
        await API.rebootSystem();
        setTimeout(() => {
            showToast('System Online', 'success');
            updateUserSettings();
        }, 1000);
    };

    // Task Creation
    document.getElementById('btn-create-task').onclick = () => {
        const input = document.getElementById('task-title');
        if (input.value) {
            createNewTask(input.value);
            input.value = '';
        }
    };
}

function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelector(`.${view}-view`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const nav = document.getElementById(`nav-${view === 'search' ? 'dashboard' : view}`);
    if (nav) nav.classList.add('active');
}

function showToast(msg, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
