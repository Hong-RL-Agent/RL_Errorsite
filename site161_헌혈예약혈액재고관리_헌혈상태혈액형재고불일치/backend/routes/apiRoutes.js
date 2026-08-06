import express from 'express';
import {
  getStaffs, getCenters, getDonors, getReservations, getQuestionnaires, getBloodLogs, getActivityLogs,
  searchReservations, updateBloodStockUnits, updateReservationStatus,
  cancelReservation, updateBloodStockLog,
  completeDonationUnauthorized, updateDonorPartial,
  deleteBloodLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/centers', getCenters);
router.get('/donors', getDonors);
router.get('/reservations', getReservations);
router.get('/questionnaires', getQuestionnaires);
router.get('/blood-logs', getBloodLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/reservations/search', searchReservations);

router.patch('/reservations/:id/blood-stock', updateBloodStockUnits);
router.patch('/reservations/:id/status', updateReservationStatus);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/update-stock-log', updateBloodStockLog);
router.post('/reservations/:id/complete-unauthorized', completeDonationUnauthorized);
router.patch('/donors/:id/partial', updateDonorPartial);
router.delete('/blood-logs/:id', deleteBloodLog);
router.post('/reset', resetData);

export default router;
