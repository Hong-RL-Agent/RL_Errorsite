const express = require('express');
const path = require('path');
const app = express();
const PORT = 9294;

app.use(express.static(path.join(__dirname, 'public')));

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Games
app.get('/api/games', (req, res) => {
    const games = [
        { id: 1, name: "Catan", genre: "Strategy", difficulty: "Beginner", players: "3-4", time: "60-120 min", image: "/assets/game_catan.webp", popular: true },
        { id: 2, name: "Splendor", genre: "Strategy", difficulty: "Beginner", players: "2-4", time: "30 min", image: "/assets/game_splendor.webp", popular: true },
        { id: 3, name: "Terraforming Mars", genre: "Strategy", difficulty: "Advanced", players: "1-5", time: "120-180 min", image: "/assets/game_terraforming.webp", popular: false },
        { id: 4, name: "Dixit", genre: "Party", difficulty: "Beginner", players: "3-6", time: "30 min", image: "/assets/game_dixit.webp", popular: true },
        { id: 5, name: "Ticket to Ride", genre: "Family", difficulty: "Beginner", players: "2-5", time: "30-60 min", image: "/assets/game_ticket.webp", popular: false },
        { id: 6, name: "Gloomhaven", genre: "RPG", difficulty: "Advanced", players: "1-4", time: "60-120 min", image: "/assets/game_gloomhaven.webp", popular: false },
        { id: 7, name: "Azul", genre: "Abstract", difficulty: "Beginner", players: "2-4", time: "30-45 min", image: "/assets/game_azul.webp", popular: true },
        { id: 8, name: "Root", genre: "Strategy", difficulty: "Advanced", players: "2-4", time: "60-90 min", image: "/assets/game_root.webp", popular: false },
        { id: 9, name: "Pandemic", genre: "Co-op", difficulty: "Beginner", players: "2-4", time: "45 min", image: "/assets/game_pandemic.webp", popular: false },
        { id: 10, name: "7 Wonders", genre: "Strategy", difficulty: "Beginner", players: "2-7", time: "30 min", image: "/assets/game_7wonders.webp", popular: true }
    ];
    res.json(games);
});

// API Tables
app.get('/api/tables', (req, res) => {
    const tables = [
        { id: "T01", seats: 4, times: ["12:00", "14:00", "16:00", "18:00", "20:00"], location: "Window Side" },
        { id: "T02", seats: 2, times: ["13:00", "15:00", "17:00", "19:00", "21:00"], location: "Inner Corner" },
        { id: "T03", seats: 6, times: ["12:30", "15:30", "18:30", "21:30"], location: "Large Table Zone" },
        { id: "T04", seats: 4, times: ["12:00", "14:30", "17:00", "19:30"], location: "Center Lounge" },
        { id: "T05", seats: 8, times: ["14:00", "18:00"], location: "Private Room A" }
    ];
    res.json(tables);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
