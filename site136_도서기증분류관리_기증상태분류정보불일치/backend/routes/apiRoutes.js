import express from 'express';
import {
  getStaffs, getDonors, getDistributors, getBooks, getClassifyLogs, getActivityLogs,
  searchBooks, updateBookDistributor, updateBookStatus,
  cancelBook, completeDistribution,
  completeDistributionUnauthorized, updateBookPartial,
  deleteClassifyLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/donors', getDonors);
router.get('/distributors', getDistributors);
router.get('/books', getBooks);
router.get('/classify-logs', getClassifyLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/books/search', searchBooks);

router.patch('/books/:id/distributor', updateBookDistributor);
router.patch('/books/:id/status', updateBookStatus);
router.post('/books/:id/cancel', cancelBook);
router.post('/books/:id/complete-distribution', completeDistribution);
router.post('/books/:id/complete-unauthorized', completeDistributionUnauthorized);
router.patch('/books/:id/partial', updateBookPartial);
router.delete('/classify-logs/:id', deleteClassifyLog);
router.post('/reset', resetData);

export default router;
