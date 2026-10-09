const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db, resetDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5009;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 1. Projects
app.get('/workspace/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch projects' });
    res.json({ projects: rows });
  });
});

app.get('/workspace/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Project not found' });
    res.json({ project: row });
  });
});

// 2. Milestones
app.get('/workspace/projects/:projectId/milestones', (req, res) => {
  const projectId = req.params.projectId;
  db.all('SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC', [projectId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch milestones' });
    res.json({ milestones: rows || [] });
  });
});

// BUG-057: Milestone Delete Cascade Failure (deletes milestone, leaves dangling reference on issues)
app.delete('/workspace/milestones/:milestoneId', (req, res) => {
  const milestoneId = req.params.milestoneId;

  db.run('DELETE FROM milestones WHERE id = ?', [milestoneId], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete milestone' });

    // BUG-057: Intentionally omits `UPDATE issues SET milestone_id = NULL WHERE milestone_id = ?`!
    // Leaving dangling foreign key references on issues table!
    res.json({
      success: true,
      deleted_milestone_id: milestoneId,
      message: 'Milestone deleted successfully'
    });
  });
});

// 3. Issues
// BUG-057 Effect: If an issue has a dangling milestone_id that doesn't exist in milestones table, throws 500
app.get('/workspace/projects/:projectId/issues', (req, res) => {
  const projectId = req.params.projectId;
  const { assignee } = req.query;

  // Check for broken foreign key references (Milestone Cascade Failure)
  db.all(
    `SELECT i.id, i.milestone_id 
     FROM issues i 
     LEFT JOIN milestones m ON i.milestone_id = m.id 
     WHERE i.project_id = ? AND i.milestone_id IS NOT NULL AND m.id IS NULL`,
    [projectId],
    (errCheck, brokenRows) => {
      if (!errCheck && brokenRows && brokenRows.length > 0) {
        // BUG-057: Dangling reference detected! Trigger Backend Runtime Error!
        return res.status(500).json({
          error: 'Internal Server Error: Dangling Milestone Foreign Key Violation',
          message: `Referenced milestone '${brokenRows[0].milestone_id}' no longer exists in database`,
          status_code: 500
        });
      }

      let query = 'SELECT * FROM issues WHERE project_id = ?';
      const params = [projectId];

      if (assignee === 'me') {
        query += ' AND assignee_email = "me@workgrid.io"';
      }

      query += ' ORDER BY id ASC';

      db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch issues' });
        res.json({
          project_id: projectId,
          total_count: rows ? rows.length : 0,
          issues: rows || []
        });
      });
    }
  );
});

// 4. Members & Invitations
app.get('/workspace/projects/:projectId/members', (req, res) => {
  const projectId = req.params.projectId;
  db.all('SELECT * FROM project_members WHERE project_id = ? ORDER BY id ASC', [projectId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch members' });
    res.json({ members: rows || [] });
  });
});

// BUG-786: Project Member Invitation Cross-leak
app.post('/workspace/projects/:projectId/invitations', (req, res) => {
  const targetProjectId = req.params.projectId;
  const { email, role = 'MEMBER' } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Add to invitations table
  db.run(
    'INSERT INTO invitations (project_id, email, role, created_at) VALUES (?, ?, ?, ?)',
    [targetProjectId, email, role, now],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to send invitation' });

      const name = email.split('@')[0];
      const avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80';

      // Insert member into target project
      db.run(
        'INSERT INTO project_members (project_id, name, email, role, avatar) VALUES (?, ?, ?, ?, ?)',
        [targetProjectId, name, email, role, avatar],
        function (err2) {
          if (err2) return res.status(500).json({ error: 'Failed to register member' });

          res.status(201).json({
            success: true,
            project_id: targetProjectId,
            invitation: { id: this.lastID, email, role, project_id: targetProjectId },
            message: `Invitation successfully dispatched to ${email}`
          });
        }
      );
    }
  );
});

// 5. Sprints
app.get('/workspace/projects/:projectId/sprints', (req, res) => {
  const projectId = req.params.projectId;
  db.all('SELECT * FROM sprints WHERE project_id = ? ORDER BY start_date ASC', [projectId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch sprints' });
    res.json({ sprints: rows || [] });
  });
});

// BUG-1445: Sprint Due-date Off-by-one Bug
app.post('/workspace/projects/:projectId/sprints', (req, res) => {
  const projectId = req.params.projectId;
  const { name, goal, start_date, end_date } = req.body;
  const sprintId = `SP-${Date.now().toString().slice(-4)}`;

  let finalEndDate = end_date || '2026-10-31';

  // BUG-1445: Date object parsing timezone conversion off-by-one shift
  if (finalEndDate === '2026-10-31' || finalEndDate.includes('10-31')) {
    // Intentionally shifts 2026-10-31 UTC to 2026-10-30
    const d = new Date('2026-10-31T00:00:00Z');
    d.setHours(d.getHours() - 12); // UTC-12 backward shift
    finalEndDate = d.toISOString().split('T')[0]; // Yields '2026-10-30'
  }

  db.run(
    'INSERT INTO sprints (id, project_id, name, goal, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, "ACTIVE")',
    [sprintId, projectId, name || 'New Sprint', goal || '', start_date || '2026-10-15', finalEndDate],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to create sprint' });
      db.get('SELECT * FROM sprints WHERE id = ?', [sprintId], (err2, row) => {
        res.status(201).json({
          success: true,
          sprint: row,
          message: 'Sprint created successfully'
        });
      });
    }
  );
});

// 6. Test Reset API
app.post(['/workspace/test/reset', '/workspace/projects/:projectId/test/reset'], (req, res) => {
  resetDb(() => {
    res.json({
      success: true,
      message: 'WorkGrid C-10 database reset to initial deterministic enterprise state'
    });
  });
});

app.listen(PORT, () => {
  console.log(`WorkGrid C-10 backend server running on http://localhost:${PORT}`);
});
