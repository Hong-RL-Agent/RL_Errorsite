import express from 'express';
import {
  getStaffs, getStudios, getGears, getReservations, getRentalLogs, getActivityLogs,
  searchGears, updateGearTime, updateGearStatus,
  cancelReservation, completeReturn,
  disposeGearUnauthorized, updateGearPartial,
  deleteRentalLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/studios', getStudios);
router.get('/gears', getGears);
router.get('/reservations', getReservations);
router.get('/rental-logs', getRentalLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/gears/search', searchGears);

router.patch('/gears/:id/time', updateGearTime);
router.patch('/gears/:id/status', updateGearStatus);
router.post('/gears/:id/cancel-reservation', cancelReservation);
router.post('/gears/:id/complete-return', completeReturn);
router.post('/gears/:id/dispose-unauthorized', disposeGearUnauthorized);
router.patch('/gears/:id/partial', updateGearPartial);
router.delete('/rental-logs/:id', deleteRentalLog);
router.post('/reset', resetData);

export default router;
