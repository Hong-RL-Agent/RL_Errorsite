import express from 'express';
import {
  getOrders,
  getReturns,
  searchReturns,
  getExchanges,
  getInquiries,
  updatePickupDate,
  updateReason,
  cancelReturn,
  approveRefund,
  deleteReturn,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/orders', getOrders);
router.get('/returns', getReturns);
router.get('/returns/search', searchReturns);
router.get('/exchanges', getExchanges);
router.get('/inquiries', getInquiries);

router.patch('/returns/:id/pickup-date', updatePickupDate);
router.patch('/returns/:id/reason', updateReason);
router.post('/returns/:id/cancel', cancelReturn);
router.patch('/returns/:id/approve', approveRefund);
router.delete('/returns/:id', deleteReturn);

router.post('/reset', resetData);

export default router;
