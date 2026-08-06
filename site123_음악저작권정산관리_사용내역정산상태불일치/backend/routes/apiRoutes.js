import express from 'express';
import {
  getStaffs, getCreators, getTracks, getRoyaltySplits, getSettlements, getUsageLogs, getActivityLogs,
  searchTracks, updateTrackSplit, updateTrackStatus,
  cancelSettlement, addUsageLog,
  confirmSettlementUnauthorized, updateTrackPartial,
  deleteUsageLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/creators', getCreators);
router.get('/tracks', getTracks);
router.get('/royalty-splits', getRoyaltySplits);
router.get('/settlements', getSettlements);
router.get('/usage-logs', getUsageLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/tracks/search', searchTracks);

router.patch('/tracks/:id/split', updateTrackSplit);
router.patch('/tracks/:id/status', updateTrackStatus);
router.post('/tracks/:id/cancel-settlement', cancelSettlement);
router.post('/tracks/:id/add-usage', addUsageLog);
router.post('/tracks/:id/confirm-unauthorized', confirmSettlementUnauthorized);
router.patch('/tracks/:id/partial', updateTrackPartial);
router.delete('/usage-logs/:id', deleteUsageLog);
router.post('/reset', resetData);

export default router;
