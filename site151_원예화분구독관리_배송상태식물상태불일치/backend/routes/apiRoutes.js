import express from 'express';
import {
  getStaffs, getPlants, getSubscribers, getDeliveries, getHealthLogs, getReplacements, getActivityLogs,
  searchSubscribers, updateSubscriberHealthStatus, updateSubscriberDeliveryStatus,
  cancelSubscription, approveReplacement,
  approveReplacementUnauthorized, updatePlantPartial,
  deleteHealthLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/plants', getPlants);
router.get('/subscribers', getSubscribers);
router.get('/deliveries', getDeliveries);
router.get('/health-logs', getHealthLogs);
router.get('/replacements', getReplacements);
router.get('/activity-logs', getActivityLogs);
router.get('/subscribers/search', searchSubscribers);

router.patch('/subscribers/:id/health-status', updateSubscriberHealthStatus);
router.patch('/subscribers/:id/delivery-status', updateSubscriberDeliveryStatus);
router.post('/subscribers/:id/cancel', cancelSubscription);
router.post('/subscribers/:id/approve-replacement', approveReplacement);
router.post('/subscribers/:id/approve-replacement-unauthorized', approveReplacementUnauthorized);
router.patch('/plants/:id/partial', updatePlantPartial);
router.delete('/health-logs/:id', deleteHealthLog);
router.post('/reset', resetData);

export default router;
