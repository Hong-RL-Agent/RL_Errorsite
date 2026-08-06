import express from 'express';
import {
  getStaffs, getAltars, getReservations, getSchedules, getVisitorGuides, getActivityLogs,
  searchAltars, updateReservationScheduleText, updateAltarStatus,
  cancelReservation, addVisitorGuide,
  terminateAltarUnauthorized, updateClientPartial,
  deleteVisitorGuide, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/altars', getAltars);
router.get('/reservations', getReservations);
router.get('/schedules', getSchedules);
router.get('/visitor-guides', getVisitorGuides);
router.get('/activity-logs', getActivityLogs);
router.get('/altars/search', searchAltars);

router.patch('/reservations/:id/schedule-text', updateReservationScheduleText);
router.patch('/altars/:id/status', updateAltarStatus);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/add-guide', addVisitorGuide);
router.post('/altars/:id/terminate-unauthorized', terminateAltarUnauthorized);
router.patch('/reservations/:id/partial', updateClientPartial);
router.delete('/visitor-guides/:id', deleteVisitorGuide);
router.post('/reset', resetData);

export default router;
