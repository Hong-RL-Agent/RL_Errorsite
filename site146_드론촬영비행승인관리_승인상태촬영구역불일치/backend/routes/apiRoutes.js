import express from 'express';
import {
  getStaffs, getZones, getDrones, getPilots, getRequests, getFlightLogs, getActivityLogs,
  searchRequests, updateRequestZone, updateRequestStatus,
  cancelRequest, completeShooting,
  approveFlightUnauthorized, updateDronePartial,
  deleteFlightLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/zones', getZones);
router.get('/drones', getDrones);
router.get('/pilots', getPilots);
router.get('/requests', getRequests);
router.get('/flight-logs', getFlightLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/requests/search', searchRequests);

router.patch('/requests/:id/zone', updateRequestZone);
router.patch('/requests/:id/status', updateRequestStatus);
router.post('/requests/:id/cancel', cancelRequest);
router.post('/requests/:id/complete-shooting', completeShooting);
router.post('/requests/:id/approve-unauthorized', approveFlightUnauthorized);
router.patch('/drones/:id/partial', updateDronePartial);
router.delete('/flight-logs/:id', deleteFlightLog);
router.post('/reset', resetData);

export default router;
