const express = require('express');
const path = require('path');
const app = express();
const PORT = 9296;

app.use(express.static(path.join(__dirname, 'public')));

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Freelancers
app.get('/api/freelancers', (req, res) => {
    const freelancers = [
        { id: 1, name: "Alex Rivers", job: "UI/UX Designer", exp: "5 years", skills: ["Figma", "Adobe XD", "Prototyping"], rating: 4.9, rate: "$50/hr", image: "/assets/profile_01.webp" },
        { id: 2, name: "Sarah Chen", job: "Frontend Developer", exp: "3 years", skills: ["React", "TypeScript", "Tailwind"], rating: 4.8, rate: "$45/hr", image: "/assets/profile_02.webp" },
        { id: 3, name: "Marcus Thorne", job: "Fullstack Developer", exp: "8 years", skills: ["Node.js", "Python", "AWS"], rating: 5.0, rate: "$70/hr", image: "/assets/profile_03.webp" },
        { id: 4, name: "Elena Gomez", job: "Graphic Designer", exp: "4 years", skills: ["Illustrator", "Photoshop", "Branding"], rating: 4.7, rate: "$40/hr", image: "/assets/profile_04.webp" },
        { id: 5, name: "David Kim", job: "Mobile Developer", exp: "6 years", skills: ["Flutter", "Swift", "Firebase"], rating: 4.9, rate: "$60/hr", image: "/assets/profile_05.webp" },
        { id: 6, name: "Sophia Bell", job: "UI/UX Designer", exp: "2 years", skills: ["Sketch", "Figma", "User Research"], rating: 4.6, rate: "$35/hr", image: "/assets/profile_06.webp" },
        { id: 7, name: "Jason Park", job: "Frontend Developer", exp: "7 years", skills: ["Vue.js", "GraphQL", "Sass"], rating: 4.9, rate: "$55/hr", image: "/assets/profile_07.webp" },
        { id: 8, name: "Olivia West", job: "Backend Developer", exp: "5 years", skills: ["Go", "PostgreSQL", "Docker"], rating: 4.8, rate: "$65/hr", image: "/assets/profile_08.webp" }
    ];
    res.json(freelancers);
});

// API Projects
app.get('/api/projects', (req, res) => {
    const projects = [
        { id: 101, title: "E-commerce Redesign", budget: "$5,000", duration: "2 months", skills: ["Figma", "React"], status: "Open" },
        { id: 102, title: "Fintech Mobile App", budget: "$12,000", duration: "4 months", skills: ["Flutter", "Node.js"], status: "In Progress" },
        { id: 103, title: "SaaS Dashboard UI", budget: "$3,500", duration: "1 month", skills: ["React", "TypeScript"], status: "Open" }
    ];
    res.json(projects);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
