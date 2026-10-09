const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.get('/', fileController.getFiles);
router.get('/:id', fileController.getFileById);
router.post('/', fileController.createFile);
router.patch('/:id', fileController.updateFile);
router.delete('/:id', fileController.deleteFile);
router.put('/:id/move', fileController.moveFile);

module.exports = router;
