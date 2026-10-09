const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db, resetDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5008;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 1. GET /v1/forms/:formId
app.get('/v1/forms/:formId', (req, res) => {
  const formId = req.params.formId;

  db.get('SELECT * FROM forms WHERE id = ?', [formId], (err, form) => {
    if (err || !form) return res.status(404).json({ error: 'Form not found' });

    db.all('SELECT * FROM form_items WHERE form_id = ? ORDER BY question_order ASC', [formId], (err2, items) => {
      if (err2) return res.status(500).json({ error: 'Failed to load form items' });

      db.all('SELECT * FROM form_options ORDER BY id ASC', (err3, options) => {
        if (err3) return res.status(500).json({ error: 'Failed to load options' });

        db.all('SELECT * FROM branch_rules WHERE form_id = ?', [formId], (err4, branches) => {
          const formattedItems = (items || []).map(item => ({
            id: item.id,
            form_id: item.form_id,
            question_order: item.question_order,
            title: item.title,
            type: item.type,
            is_required: !!item.is_required,
            description: item.description,
            options: (options || []).filter(o => o.item_id === item.id).map(o => ({
              id: o.id,
              label: o.label,
              value: o.value,
              score: o.score
            }))
          }));

          res.json({
            form: {
              ...form,
              items: formattedItems,
              branch_rules: branches || []
            }
          });
        });
      });
    });
  });
});

// 2. POST /v1/sessions
app.post('/v1/sessions', (req, res) => {
  const { form_id = 'pulse-001', formId = 'pulse-001' } = req.body;
  const targetFormId = form_id || formId;
  const sessionId = `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.run(
    'INSERT INTO response_sessions (session_id, form_id, current_step, status, answers_json, created_at, updated_at) VALUES (?, ?, 1, "IN_PROGRESS", "{}", ?, ?)',
    [sessionId, targetFormId, now, now],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to initialize session' });
      res.status(201).json({
        session_id: sessionId,
        sessionId: sessionId,
        form_id: targetFormId,
        formId: targetFormId,
        current_step: 1,
        status: 'IN_PROGRESS',
        answers: {}
      });
    }
  );
});

// 3. GET /v1/sessions/:sessionId
app.get('/v1/sessions/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  db.get('SELECT * FROM response_sessions WHERE session_id = ?', [sessionId], (err, session) => {
    if (err || !session) return res.status(404).json({ error: 'Session not found' });
    let answers = {};
    try { answers = JSON.parse(session.answers_json || '{}'); } catch (e) {}

    res.json({
      session_id: session.session_id,
      sessionId: session.session_id,
      form_id: session.form_id,
      formId: session.form_id,
      current_step: session.current_step,
      status: session.status,
      answers
    });
  });
});

// 4. POST /v1/sessions/:sessionId/answers
// BUG-868: Matrix Choice Submission Drop (returns 400 when value is 'NORMAL' instead of 'AVERAGE')
app.post('/v1/sessions/:sessionId/answers', (req, res) => {
  const sessionId = req.params.sessionId;
  const { item_id, itemId, value, score } = req.body;
  const targetItemId = item_id || itemId;

  // BUG-868 check: Frontend submits 'NORMAL' for Q5 3-score option, but Backend strictly requires 'AVERAGE'
  if (targetItemId === 'q5' && value === 'NORMAL') {
    return res.status(400).json({
      error: "Bad Request: Invalid option enum value 'NORMAL'. Expected valid enum: 'AVERAGE'",
      item_id: 'q5',
      received_value: 'NORMAL',
      status_code: 400
    });
  }

  db.get('SELECT * FROM response_sessions WHERE session_id = ?', [sessionId], (err, session) => {
    if (err || !session) return res.status(404).json({ error: 'Session not found' });

    let answers = {};
    try { answers = JSON.parse(session.answers_json || '{}'); } catch (e) {}

    answers[targetItemId] = { value, score: score || 0 };
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.run(
      'UPDATE response_sessions SET answers_json = ?, updated_at = ? WHERE session_id = ?',
      [JSON.stringify(answers), now, sessionId],
      (err2) => {
        if (err2) return res.status(500).json({ error: 'Failed to record answer' });
        res.json({
          success: true,
          session_id: sessionId,
          saved_item_id: targetItemId,
          answers
        });
      }
    );
  });
});

// 5. POST /v1/sessions/:sessionId/complete
// BUG-014: Survey Response Counter Inconsistency
// Total submission records are updated (+1), but question_statistics table update is skipped!
app.post('/v1/sessions/:sessionId/complete', (req, res) => {
  const sessionId = req.params.sessionId;

  db.get('SELECT * FROM response_sessions WHERE session_id = ?', [sessionId], (err, session) => {
    if (err || !session) return res.status(404).json({ error: 'Session not found' });

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const answersJson = session.answers_json || '{}';

    // 1. Insert into submission_records (Incrementing total submissions count!)
    db.run(
      'INSERT INTO submission_records (form_id, session_id, answers_json, submitted_at) VALUES (?, ?, ?, ?)',
      [session.form_id, sessionId, answersJson, now],
      function (err2) {
        if (err2) return res.status(500).json({ error: 'Failed to complete submission' });

        // Update session status
        db.run('UPDATE response_sessions SET status = "COMPLETED", updated_at = ? WHERE session_id = ?', [now, sessionId], () => {
          // BUG-014: Intentionally OMIT updating question_statistics!
          // Consequently, total submissions = 101, while question_statistics sum = 100!
          res.json({
            success: true,
            message: 'Survey response submitted successfully',
            submission_id: this.lastID,
            session_id: sessionId,
            submitted_at: now
          });
        });
      }
    );
  });
});

// 6. GET /v1/insights/:formId & GET /v1/insights/:formId/summary
app.get(['/v1/insights/:formId', '/v1/insights/:formId/summary'], (req, res) => {
  const formId = req.params.formId || 'pulse-001';

  // Count total submissions
  db.get('SELECT COUNT(*) as total_responses FROM submission_records WHERE form_id = ?', [formId], (err, subRow) => {
    if (err) return res.status(500).json({ error: 'Failed to calculate insights' });

    const totalResponses = subRow ? subRow.total_responses : 100;

    // Get question stats
    db.all('SELECT * FROM question_statistics WHERE form_id = ?', [formId], (err2, statRows) => {
      if (err2) return res.status(500).json({ error: 'Failed to load statistics' });

      // Group by question
      const breakdown = {};
      (statRows || []).forEach(row => {
        if (!breakdown[row.item_id]) {
          breakdown[row.item_id] = {
            item_id: row.item_id,
            sum_of_answers: 0,
            options: []
          };
        }
        breakdown[row.item_id].sum_of_answers += row.count;
        breakdown[row.item_id].options.push({
          option_value: row.option_value,
          count: row.count
        });
      });

      res.json({
        form_id: formId,
        total_responses: totalResponses,
        totalResponses: totalResponses,
        question_breakdown: breakdown,
        questionBreakdown: breakdown,
        last_updated: '2026-10-08 16:50:00'
      });
    });
  });
});

// 7. POST /v1/test/reset
app.post('/v1/test/reset', (req, res) => {
  resetDb(() => {
    res.json({
      success: true,
      message: 'PulseForm C-09 database reset to initial deterministic state (100 responses)'
    });
  });
});

app.listen(PORT, () => {
  console.log(`PulseForm C-09 backend server running on http://localhost:${PORT}`);
});
