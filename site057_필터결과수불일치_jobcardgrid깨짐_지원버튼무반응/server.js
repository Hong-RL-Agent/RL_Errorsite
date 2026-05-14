const express = require('express');
const path = require('path');
const app = express();
const PORT = 9276;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mock Data: Jobs
const jobs = [
    {
        id: 1,
        company: 'CloudScale',
        title: 'Senior Frontend Developer',
        location: 'Remote (Worldwide)',
        remoteType: 'Full Remote',
        salary: '$120k - $160k',
        techStack: ['React', 'TypeScript', 'Node.js'],
        deadline: '2026-06-15'
    },
    {
        id: 2,
        company: 'DevStream',
        title: 'Backend Engineer (Python)',
        location: 'Remote (USA/Europe)',
        remoteType: 'Hybrid Remote',
        salary: '$100k - $140k',
        techStack: ['Python', 'Django', 'PostgreSQL'],
        deadline: '2026-05-30'
    },
    {
        id: 3,
        company: 'PixelPoint',
        title: 'Product Designer (UI/UX)',
        location: 'Remote (Asia/Europe)',
        remoteType: 'Full Remote',
        salary: '$80k - $110k',
        techStack: ['Figma', 'Prototyping', 'User Research'],
        deadline: '2026-06-05'
    },
    {
        id: 4,
        company: 'NovaSoft',
        title: 'Fullstack Engineer',
        location: 'Remote (Worldwide)',
        remoteType: 'Full Remote',
        salary: '$110k - $150k',
        techStack: ['Next.js', 'Go', 'GraphQL'],
        deadline: '2026-06-10'
    },
    {
        id: 5,
        company: 'CloudScale',
        title: 'DevOps Specialist',
        location: 'Remote (Europe)',
        remoteType: 'Full Remote',
        salary: '$130k - $170k',
        techStack: ['AWS', 'Kubernetes', 'Terraform'],
        deadline: '2026-05-25'
    },
    {
        id: 6,
        company: 'PixelPoint',
        title: 'Graphic Designer',
        location: 'Remote (Worldwide)',
        remoteType: 'Project Based',
        salary: '$60k - $90k',
        techStack: ['Photoshop', 'Illustrator', 'Branding'],
        deadline: '2026-06-20'
    }
];

// Mock Data: Companies
const companies = [
    { name: 'CloudScale', industry: 'Cloud Infrastructure', openings: 12 },
    { name: 'DevStream', industry: 'Developer Tools', openings: 8 },
    { name: 'PixelPoint', industry: 'Design Agency', openings: 15 },
    { name: 'NovaSoft', industry: 'Enterprise SaaS', openings: 5 }
];

// API: Jobs
app.get('/api/jobs', (req, res) => {
    res.json(jobs);
});

// API: Companies
app.get('/api/companies', (req, res) => {
    res.json(companies);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
