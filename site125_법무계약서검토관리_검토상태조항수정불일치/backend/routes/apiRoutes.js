import express from 'express';
import {
  getStaffs, getClients, getContracts, getClauses, getComments, getActivityLogs,
  searchContracts, updateContractClause, updateContractStatus,
  rejectContract, addReviewComment,
  approveContractUnauthorized, updateContractPartial,
  deleteComment, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/clients', getClients);
router.get('/contracts', getContracts);
router.get('/clauses', getClauses);
router.get('/comments', getComments);
router.get('/activity-logs', getActivityLogs);
router.get('/contracts/search', searchContracts);

router.patch('/contracts/:id/clause', updateContractClause);
router.patch('/contracts/:id/status', updateContractStatus);
router.post('/contracts/:id/reject', rejectContract);
router.post('/contracts/:id/add-comment', addReviewComment);
router.post('/contracts/:id/approve-unauthorized', approveContractUnauthorized);
router.patch('/contracts/:id/partial', updateContractPartial);
router.delete('/comments/:id', deleteComment);
router.post('/reset', resetData);

export default router;
