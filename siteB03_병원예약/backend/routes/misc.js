const router = require('express').Router();
const c = require('../controllers/miscController');

router.get('/health', c.health);
router.get('/notifications', c.notifications);
router.patch('/notifications/:id/read', c.markRead);
router.get('/activity', c.activity);
router.post('/test/reset', c.reset);

module.exports = router;
