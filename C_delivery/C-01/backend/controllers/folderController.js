const store = require('../data/store');

exports.getFolders = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (parentId === 'all') {
      const folders = await store.getAllFolders();
      return res.json({ success: true, data: folders });
    }
    const folders = await store.getFolders(parentId || null);
    res.json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFolderById = async (req, res) => {
  try {
    const folder = await store.getFolderById(req.params.id);
    if (!folder) {
      return res.status(404).json({ success: false, error: 'Folder not found' });
    }
    res.json({ success: true, data: folder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    // BUG-885: No duplicate check / double-click protection -> returns 201 Created on every call
    const newFolder = await store.createFolder({ name, parentId });
    res.status(201).json({ success: true, data: newFolder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await store.updateFolder(req.params.id, { name });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Folder not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const deleted = await store.deleteFolder(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Folder not found' });
    }
    res.json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
