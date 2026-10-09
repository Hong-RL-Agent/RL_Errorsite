const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db, resetDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// GET /api/tickets - List with filters
app.get('/api/tickets', (req, res) => {
  const { category, status, search, priority, sort } = req.query;

  let query = 'SELECT * FROM tickets WHERE 1=1';
  const params = [];

  if (category && category !== 'ALL') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (status && status !== 'ALL') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (priority && priority !== 'ALL') {
    query += ' AND priority = ?';
    params.push(priority);
  }

  if (search && search.trim() !== '') {
    query += ' AND (subject LIKE ? OR content LIKE ? OR customer_name LIKE ? OR id LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  if (sort === 'oldest') {
    query += ' ORDER BY id ASC';
  } else {
    query += ' ORDER BY id DESC';
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tickets' });
    }
    res.json({ tickets: rows, total: rows.length });
  });
});

// GET /api/tickets/:id - Detail with replies
app.get('/api/tickets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.get('SELECT * FROM tickets WHERE id = ?', [id], (err, ticket) => {
    if (err || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    db.all('SELECT * FROM replies WHERE ticket_id = ? ORDER BY id ASC', [id], (err2, replies) => {
      if (err2) {
        return res.status(500).json({ error: 'Failed to fetch replies' });
      }

      db.get('SELECT content, updated_at FROM drafts WHERE ticket_id = ?', [id], (err3, draft) => {
        res.json({
          ticket,
          replies: replies || [],
          draft: draft ? draft.content : ''
        });
      });
    });
  });
});

// PUT /api/tickets/:id/status - Update Status
app.put('/api/tickets/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  db.run(
    'UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?',
    [status, now, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update ticket status' });
      }
      db.get('SELECT * FROM tickets WHERE id = ?', [id], (err2, row) => {
        res.json({ success: true, ticket: row });
      });
    }
  );
});

// PUT /api/tickets/:id/category - Update Category
app.put('/api/tickets/:id/category', (req, res) => {
  const id = parseInt(req.params.id);
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  db.run(
    'UPDATE tickets SET category = ?, updated_at = ? WHERE id = ?',
    [category, now, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update category' });
      }
      db.get('SELECT * FROM tickets WHERE id = ?', [id], (err2, row) => {
        res.json({ success: true, ticket: row });
      });
    }
  );
});

// GET /api/tickets/:id/replies
app.get('/api/tickets/:id/replies', (req, res) => {
  const id = parseInt(req.params.id);
  db.all('SELECT * FROM replies WHERE ticket_id = ? ORDER BY id ASC', [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch replies' });
    }
    res.json({ replies: rows });
  });
});

// POST /api/tickets/:id/replies - Submit reply
app.post('/api/tickets/:id/replies', (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { content, author = '상담원 김지원' } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  // BUG-896: Generic Error on Long Reply (length > 1000)
  if (content.length > 1000) {
    return res.status(500).json({
      error: '500 Internal Server Error',
      message: 'Server failed to process long payload chunk size violation in memory buffer stream'
    });
  }

  // BUG-1686: Answer Input Duplication (e.g. ticket 1041 or last segment duplication)
  let finalContent = content;
  if (ticketId === 1041) {
    const trimmed = content.trim();
    const sentences = trimmed.split(/(?<=[.?!])\s+/);
    if (sentences.length > 0) {
      const lastSentence = sentences[sentences.length - 1];
      finalContent = `${trimmed}\n${lastSentence}`;
    } else {
      finalContent = `${trimmed}\n${trimmed}`;
    }
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.run(
    'INSERT INTO replies (ticket_id, author, author_type, content, created_at) VALUES (?, ?, ?, ?, ?)',
    [ticketId, author, 'AGENT', finalContent, now],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create reply' });
      }

      const newReplyId = this.lastID;

      // Update ticket status to ANSWERED and updated_at
      db.run(
        'UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?',
        ['ANSWERED', now, ticketId],
        (err2) => {
          // Delete draft if exists
          db.run('DELETE FROM drafts WHERE ticket_id = ?', [ticketId], () => {
            db.get('SELECT * FROM replies WHERE id = ?', [newReplyId], (err3, reply) => {
              res.status(201).json({
                success: true,
                reply,
                message: 'Reply submitted successfully'
              });
            });
          });
        }
      );
    }
  );
});

// POST /api/tickets/:id/draft - Save Draft
app.post('/api/tickets/:id/draft', (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { content } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.run(
    'INSERT INTO drafts (ticket_id, content, updated_at) VALUES (?, ?, ?) ON CONFLICT(ticket_id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at',
    [ticketId, content || '', now],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save draft' });
      }
      res.json({ success: true, message: 'Draft saved' });
    }
  );
});

// GET /api/tickets/:id/draft
app.get('/api/tickets/:id/draft', (req, res) => {
  const ticketId = parseInt(req.params.id);
  db.get('SELECT * FROM drafts WHERE ticket_id = ?', [ticketId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get draft' });
    }
    res.json({ draft: row ? row.content : '' });
  });
});

// GET /api/templates - List templates
app.get('/api/templates', (req, res) => {
  db.all('SELECT * FROM templates ORDER BY id ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch templates' });
    }
    res.json({ templates: rows });
  });
});

// POST /api/test/reset - Deterministic reset
app.post('/api/test/reset', (req, res) => {
  resetDb(() => {
    res.json({ success: true, message: 'SupportHub C-04 database reset to initial deterministic state' });
  });
});

app.listen(PORT, () => {
  console.log(`SupportHub C-04 backend server running on http://localhost:${PORT}`);
});
