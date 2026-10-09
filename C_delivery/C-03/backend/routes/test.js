const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.post('/reset', testController.resetState);
router.get('/status', testController.getStatus);

module.exports = router;
