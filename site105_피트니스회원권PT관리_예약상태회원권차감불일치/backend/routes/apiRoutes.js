import express from 'express';
import {
  getTrainers,
  getMembers,
  getMembershipPasses,
  getReservations,
  getAttendanceLogs,
  getActivityLogs,
  searchReservations,
  updateReservationTime,
  updateReservationTrainer,
  cancelReservation,
  checkInAttendance,
  deductPassUnauthorized,
  updateMemberPartial,
  deleteAttendanceLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/trainers', getTrainers);
router.get('/members', getMembers);
router.get('/membership-passes', getMembershipPasses);
router.get('/reservations', getReservations);
router.get('/attendance-logs', getAttendanceLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/reservations/search', searchReservations);

router.patch('/reservations/:id/time', updateReservationTime);
router.patch('/reservations/:id/trainer', updateReservationTrainer);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/check-in', checkInAttendance);
router.post('/passes/:id/deduct-unauthorized', deductPassUnauthorized);
router.patch('/members/:id/partial', updateMemberPartial);

router.delete('/attendance-logs/:id', deleteAttendanceLog);
router.post('/reset', resetData);

export default router;
