const router = require('express').Router();
const c = require('../controllers/appointmentController');

router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', c.create);
router.patch('/:id', c.update);
router.post('/:id/cancel', c.cancel);
router.post('/:id/confirm', c.confirm);

module.exports = router;
