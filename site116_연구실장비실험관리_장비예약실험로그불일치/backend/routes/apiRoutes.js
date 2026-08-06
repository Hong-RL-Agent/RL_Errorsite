import express from 'express';
import {
  getResearchers, getEquipments, getReservations, getExpLogs, getMaintenanceRequests, getActivityLogs,
  searchEquipments, updateReservationTime, addExpLog,
  cancelReservation, completeEquipmentUse,
  disableEquipmentUnauthorized, updateEquipmentPartial,
  deleteExpLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/researchers', getResearchers);
router.get('/equipments', getEquipments);
router.get('/reservations', getReservations);
router.get('/exp-logs', getExpLogs);
router.get('/maintenance-requests', getMaintenanceRequests);
router.get('/activity-logs', getActivityLogs);
router.get('/equipments/search', searchEquipments);

router.patch('/reservations/:id/time', updateReservationTime);
router.post('/exp-logs', addExpLog);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/complete-use', completeEquipmentUse);
router.post('/equipments/:id/disable-unauthorized', disableEquipmentUnauthorized);
router.patch('/equipments/:id/partial', updateEquipmentPartial);
router.delete('/exp-logs/:id', deleteExpLog);
router.post('/reset', resetData);

export default router;
