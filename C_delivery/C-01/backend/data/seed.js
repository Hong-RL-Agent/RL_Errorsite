const INITIAL_FOLDERS = [
  {
    id: 'folder-documents',
    name: 'Documents',
    parentId: null,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
    itemCount: 3
  },
  {
    id: 'folder-projects',
    name: 'Projects',
    parentId: null,
    createdAt: '2026-03-01T09:05:00.000Z',
    updatedAt: '2026-03-01T09:05:00.000Z',
    itemCount: 2
  },
  {
    id: 'folder-archive',
    name: 'Archive',
    parentId: null,
    createdAt: '2026-03-01T09:10:00.000Z',
    updatedAt: '2026-03-01T09:10:00.000Z',
    itemCount: 1
  }
];

const INITIAL_FILES = [
  {
    id: 'file-a-txt',
    name: 'A.txt',
    folderId: 'folder-documents',
    size: 12288,
    mimeType: 'text/plain',
    createdAt: '2026-03-05T10:00:00.000Z',
    updatedAt: '2026-03-05T10:00:00.000Z',
    order: 1
  },
  {
    id: 'file-b-txt',
    name: 'B.txt',
    folderId: 'folder-documents',
    size: 8192,
    mimeType: 'text/plain',
    createdAt: '2026-03-05T10:01:00.000Z',
    updatedAt: '2026-03-05T10:01:00.000Z',
    order: 2
  },
  {
    id: 'file-report-pdf',
    name: 'Report.pdf',
    folderId: 'folder-documents',
    size: 1258291,
    mimeType: 'application/pdf',
    createdAt: '2026-03-05T10:02:00.000Z',
    updatedAt: '2026-03-05T10:02:00.000Z',
    order: 3
  },
  {
    id: 'file-design-docx',
    name: 'Design.docx',
    folderId: 'folder-projects',
    size: 460800,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    createdAt: '2026-03-06T14:20:00.000Z',
    updatedAt: '2026-03-06T14:20:00.000Z',
    order: 1
  },
  {
    id: 'file-notes-txt',
    name: 'Notes.txt',
    folderId: 'folder-projects',
    size: 15360,
    mimeType: 'text/plain',
    createdAt: '2026-03-06T14:25:00.000Z',
    updatedAt: '2026-03-06T14:25:00.000Z',
    order: 2
  },
  {
    id: 'file-old-report-pdf',
    name: 'Old_Report.pdf',
    folderId: 'folder-archive',
    size: 2202009,
    mimeType: 'application/pdf',
    createdAt: '2026-02-15T08:30:00.000Z',
    updatedAt: '2026-02-15T08:30:00.000Z',
    order: 1
  }
];

module.exports = {
  INITIAL_FOLDERS,
  INITIAL_FILES
};
