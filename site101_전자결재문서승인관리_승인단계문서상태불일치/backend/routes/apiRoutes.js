import express from 'express';
import {
  getDepartments,
  getEmployees,
  getDocuments,
  getApprovalLines,
  getComments,
  getActivityLogs,
  searchDocuments,
  updateApprovalLine,
  updateDocumentStatus,
  rejectDocument,
  submitApprovalComment,
  approveDocumentUnauthorized,
  updateDocPartial,
  deleteActivityLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/departments', getDepartments);
router.get('/employees', getEmployees);
router.get('/documents', getDocuments);
router.get('/approval-lines', getApprovalLines);
router.get('/comments', getComments);
router.get('/activity-logs', getActivityLogs);
router.get('/documents/search', searchDocuments);

router.patch('/documents/:id/line', updateApprovalLine);
router.patch('/documents/:id/status', updateDocumentStatus);
router.post('/documents/:id/reject', rejectDocument);
router.post('/documents/:id/comment', submitApprovalComment);
router.post('/documents/:id/approve-unauthorized', approveDocumentUnauthorized);
router.patch('/documents/:id/partial', updateDocPartial);

router.delete('/activity-logs/:id', deleteActivityLog);
router.post('/reset', resetData);

export default router;
