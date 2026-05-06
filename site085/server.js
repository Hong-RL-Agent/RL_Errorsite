const express = require('express');
const path = require('path');
const app = express();
const PORT = 9304;

app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const exams = [
  {
    id: 'ex001',
    name: 'Information Processing Engineer',
    category: 'IT/Computer',
    region: 'Seoul',
    regStart: '2026-05-10',
    regEnd: '2026-05-20',
    examDate: '2026-06-15',
    status: 'open'
  },
  {
    id: 'ex002',
    name: 'Certified Public Accountant (CPA)',
    category: 'Finance/Accounting',
    region: 'Gyeonggi',
    regStart: '2026-04-01',
    regEnd: '2026-04-15',
    examDate: '2026-05-30',
    status: 'closed'
  },
  {
    id: 'ex003',
    name: 'Civil Engineering Technician',
    category: 'Construction',
    region: 'Busan',
    regStart: '2026-05-15',
    regEnd: '2026-05-25',
    examDate: '2026-07-10',
    status: 'open'
  },
  {
    id: 'ex004',
    name: 'Digital Forensic Specialist',
    category: 'Security',
    region: 'Seoul',
    regStart: '2026-05-01',
    regEnd: '2026-05-15',
    examDate: '2026-06-05',
    status: 'open' // Bug target for no-response button
  },
  {
    id: 'ex005',
    name: 'Social Worker Level 1',
    category: 'Social Welfare',
    region: 'Daegu',
    regStart: '2026-06-01',
    regEnd: '2026-06-10',
    examDate: '2026-08-20',
    status: 'upcoming'
  },
  {
    id: 'ex006',
    name: 'Industrial Safety Engineer',
    category: 'IT/Computer',
    region: 'Incheon',
    regStart: '2026-05-05',
    regEnd: '2026-05-12',
    examDate: '2026-06-25',
    status: 'open'
  }
];

const notices = [
  {
    id: 'n001',
    title: 'Notice regarding the 2026 Exam ID Card Requirement',
    date: '2026-05-01',
    priority: true,
    content: 'All candidates must bring a valid government-issued ID card. Digital IDs are also accepted if they are from the official government app.'
  },
  {
    id: 'n002',
    title: 'Venue Change for Seoul Region (Information Processing Engineer)',
    date: '2026-05-04',
    priority: false,
    content: 'The venue for the Seoul region Information Processing Engineer exam has been changed from Seoul High School to Gangnam University.'
  },
  {
    id: 'n003',
    title: 'System Maintenance Notice (May 15)',
    date: '2026-05-05',
    priority: false,
    content: 'The online registration system will be unavailable on May 15 from 02:00 to 06:00 KST due to scheduled maintenance.'
  }
];

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/exams', (req, res) => {
  res.json(exams);
});

app.get('/api/notices', (req, res) => {
  res.json(notices);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
