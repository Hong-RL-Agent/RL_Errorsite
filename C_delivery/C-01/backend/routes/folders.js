const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');

router.get('/', folderController.getFolders);
router.get('/:id', folderController.getFolderById);
router.post('/', folderController.createFolder);
router.patch('/:id', folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);

module.exports = router;
