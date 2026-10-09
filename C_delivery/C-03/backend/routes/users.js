const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get('/audit-logs', userController.getAuditLogs);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/status', userController.updateUserStatus);
router.post('/:id/password-reset', userController.passwordReset);

module.exports = router;
