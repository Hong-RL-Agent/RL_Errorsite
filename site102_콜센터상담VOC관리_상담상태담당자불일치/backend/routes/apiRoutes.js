import express from 'express';
import {
  getVocCategories,
  getAgents,
  getCustomers,
  getConsultations,
  getMemos,
  getActivityLogs,
  searchConsultations,
  updateCallStatus,
  updateCallAgent,
  completeCall,
  reopenCall,
  updateStatusUnauthorized,
  updateCustomerPartial,
  deleteMemo,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/voc-categories', getVocCategories);
router.get('/agents', getAgents);
router.get('/customers', getCustomers);
router.get('/consultations', getConsultations);
router.get('/memos', getMemos);
router.get('/activity-logs', getActivityLogs);
router.get('/consultations/search', searchConsultations);

router.patch('/calls/:id/status', updateCallStatus);
router.patch('/calls/:id/agent', updateCallAgent);
router.post('/calls/:id/complete', completeCall);
router.post('/calls/:id/reopen', reopenCall);
router.patch('/calls/:id/status-unauthorized', updateStatusUnauthorized);
router.patch('/customers/:id/partial', updateCustomerPartial);

router.delete('/memos/:id', deleteMemo);
router.post('/reset', resetData);

export default router;
