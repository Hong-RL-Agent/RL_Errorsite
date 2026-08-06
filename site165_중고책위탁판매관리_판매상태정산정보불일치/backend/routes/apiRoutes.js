import express from 'express';
import {
  getStaffs, getConsignors, getBooks, getSales, getSettlements, getInspectionLogs, getActivityLogs,
  searchBooks, updatePayoutAmount, updateBookStatus,
  cancelSale, processSettlementComplete,
  processSettlementUnauthorized, updateBookPartial,
  deleteInspectionLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/consignors', getConsignors);
router.get('/books', getBooks);
router.get('/sales', getSales);
router.get('/settlements', getSettlements);
router.get('/inspection-logs', getInspectionLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/books/search', searchBooks);

router.patch('/books/:id/payout', updatePayoutAmount);
router.patch('/books/:id/status', updateBookStatus);
router.post('/books/:id/cancel-sale', cancelSale);
router.post('/books/:id/process-settlement', processSettlementComplete);
router.post('/books/:id/settle-unauthorized', processSettlementUnauthorized);
router.patch('/books/:id/partial', updateBookPartial);
router.delete('/inspection-logs/:id', deleteInspectionLog);
router.post('/reset', resetData);

export default router;
