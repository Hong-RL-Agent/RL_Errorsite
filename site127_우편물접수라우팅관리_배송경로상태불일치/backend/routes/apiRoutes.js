import express from 'express';
import {
  getStaffs, getHubs, getRoutesList, getParcels, getDeliveryLogs, getActivityLogs,
  searchParcels, updateParcelRoute, updateParcelStatus,
  returnParcel, completeDelivery,
  completeDeliveryUnauthorized, updateRecipientPartial,
  deleteDeliveryLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/hubs', getHubs);
router.get('/routes-list', getRoutesList);
router.get('/parcels', getParcels);
router.get('/delivery-logs', getDeliveryLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/parcels/search', searchParcels);

router.patch('/parcels/:id/route', updateParcelRoute);
router.patch('/parcels/:id/status', updateParcelStatus);
router.post('/parcels/:id/return', returnParcel);
router.post('/parcels/:id/complete-delivery', completeDelivery);
router.post('/parcels/:id/complete-unauthorized', completeDeliveryUnauthorized);
router.patch('/parcels/:id/partial', updateRecipientPartial);
router.delete('/delivery-logs/:id', deleteDeliveryLog);
router.post('/reset', resetData);

export default router;
