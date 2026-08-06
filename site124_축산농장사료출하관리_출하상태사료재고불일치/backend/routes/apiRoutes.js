import express from 'express';
import {
  getStaffs, getBarns, getFeeds, getLivestocks, getShipments, getFeedLogs, getActivityLogs,
  searchLivestocks, updateLivestockFeed, updateLivestockStatus,
  cancelShipment, addHealthRecord,
  confirmShipmentUnauthorized, updateLivestockPartial,
  deleteFeedLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/barns', getBarns);
router.get('/feeds', getFeeds);
router.get('/livestocks', getLivestocks);
router.get('/shipments', getShipments);
router.get('/feed-logs', getFeedLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/livestocks/search', searchLivestocks);

router.patch('/livestocks/:id/feed', updateLivestockFeed);
router.patch('/livestocks/:id/status', updateLivestockStatus);
router.post('/livestocks/:id/cancel-shipment', cancelShipment);
router.post('/livestocks/:id/add-health', addHealthRecord);
router.post('/livestocks/:id/confirm-unauthorized', confirmShipmentUnauthorized);
router.patch('/livestocks/:id/partial', updateLivestockPartial);
router.delete('/feed-logs/:id', deleteFeedLog);
router.post('/reset', resetData);

export default router;
