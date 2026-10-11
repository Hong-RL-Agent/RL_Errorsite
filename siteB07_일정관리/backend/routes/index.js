const express = require('express');
const ev = require('../controllers/eventController');
const misc = require('../controllers/miscController');

const router = express.Router();

router.get('/health', misc.health);

router.get('/users', misc.users);
router.get('/users/:id', misc.user);
router.get('/categories', misc.categories);

// 고정 경로는 /events/:id 보다 먼저 선언
router.get('/events/search', ev.search);
router.get('/events/calendar', ev.calendar);
router.get('/events/statistics', ev.statistics);
router.get('/events', ev.list);
router.post('/events', ev.create);
router.get('/events/:id', ev.detail);
router.patch('/events/:id', ev.update);
router.delete('/events/:id', ev.remove);
router.get('/events/:id/notes', misc.listNotes);
router.post('/events/:id/notes', misc.createNote);
router.patch('/notes/:id', misc.updateNote);

router.get('/recurring-events', ev.listRecurring);
router.post('/recurring-events', ev.createRecurring);
router.patch('/recurring-events/:id', ev.updateRecurring);

router.get('/tasks', misc.listTasks);
router.post('/tasks', misc.createTask);
router.patch('/tasks/:id', misc.updateTask);
router.delete('/tasks/:id', misc.deleteTask);

router.get('/notifications', misc.notifications);
router.patch('/notifications/:id/read', misc.markNotification);

router.get('/activity', misc.activity);

router.post('/test/reset', misc.reset);

module.exports = router;
