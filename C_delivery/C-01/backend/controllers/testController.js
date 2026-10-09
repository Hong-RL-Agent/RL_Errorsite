const store = require('../data/store');

exports.resetState = async (req, res) => {
  try {
    await store.reset();
    const folders = await store.getAllFolders();
    const files = await store.getFiles();
    res.json({
      success: true,
      message: 'SQLite database reset successfully to deterministic initial state',
      timestamp: new Date().toISOString(),
      foldersCount: folders.length,
      filesCount: files.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const folders = await store.getAllFolders();
    const files = await store.getFiles();
    res.json({
      success: true,
      siteId: 'C-01',
      siteType: 'Training',
      replayType: 'ACTION_REPLAY',
      dbType: 'SQLite3',
      folders,
      files
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
