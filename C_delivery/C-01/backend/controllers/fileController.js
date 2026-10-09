const store = require('../data/store');

exports.getFiles = async (req, res) => {
  try {
    const { folderId, search } = req.query;
    const files = await store.getFiles({ folderId: folderId || null, search });
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const file = await store.getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createFile = async (req, res) => {
  try {
    const { name, folderId, size, mimeType } = req.body;
    const newFile = await store.createFile({ name, folderId, size, mimeType });
    res.status(201).json({ success: true, data: newFile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateFile = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await store.updateFile(req.params.id, { name });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    // BUG-2002: Returns 200 OK with truncated name if name > 30 chars
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    // BUG-112: If id === 'file-a-txt', store throws 500 error
    const deleted = await store.deleteFile(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

exports.moveFile = async (req, res) => {
  try {
    const { targetFolderId } = req.body;
    if (!targetFolderId) {
      return res.status(400).json({ success: false, error: 'targetFolderId is required' });
    }
    // BUG-1800: If id === 'file-a-txt' && targetFolderId === 'folder-archive', store throws 500 error
    const moved = await store.moveFile(req.params.id, targetFolderId);
    res.json({ success: true, data: moved });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};
