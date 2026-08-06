import express from 'express';
import {
  getStaffs, getAuthors, getBooks, getContracts, getSettlements, getSalesLogs, getActivityLogs,
  searchBooks, updateContractRoyalty, updateContractStatus,
  cancelContract, addSalesCopies,
  confirmSettlementUnauthorized, updateBookPartial,
  deleteSalesLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/authors', getAuthors);
router.get('/books', getBooks);
router.get('/contracts', getContracts);
router.get('/settlements', getSettlements);
router.get('/sales-logs', getSalesLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/books/search', searchBooks);

router.patch('/contracts/:id/royalty', updateContractRoyalty);
router.patch('/contracts/:id/status', updateContractStatus);
router.post('/contracts/:id/cancel', cancelContract);
router.post('/contracts/:id/add-sales', addSalesCopies);
router.post('/settlements/:id/confirm-unauthorized', confirmSettlementUnauthorized);
router.patch('/books/:id/partial', updateBookPartial);
router.delete('/sales-logs/:id', deleteSalesLog);
router.post('/reset', resetData);

export default router;
