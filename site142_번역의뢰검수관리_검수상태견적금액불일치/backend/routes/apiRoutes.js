import express from 'express';
import {
  getStaffs, getClients, getTranslators, getRequests, getReviewComments, getActivityLogs,
  searchRequests, updateRequestFee, updateRequestStatus,
  cancelRequest, completeDelivery,
  confirmQuoteUnauthorized, updateClientPartial,
  deleteReviewComment, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/clients', getClients);
router.get('/translators', getTranslators);
router.get('/requests', getRequests);
router.get('/review-comments', getReviewComments);
router.get('/activity-logs', getActivityLogs);
router.get('/requests/search', searchRequests);

router.patch('/requests/:id/fee', updateRequestFee);
router.patch('/requests/:id/status', updateRequestStatus);
router.post('/requests/:id/cancel', cancelRequest);
router.post('/requests/:id/complete-delivery', completeDelivery);
router.post('/requests/:id/confirm-quote-unauthorized', confirmQuoteUnauthorized);
router.patch('/clients/:id/partial', updateClientPartial);
router.delete('/review-comments/:id', deleteReviewComment);
router.post('/reset', resetData);

export default router;
