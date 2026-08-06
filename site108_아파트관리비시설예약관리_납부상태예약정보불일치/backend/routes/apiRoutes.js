import express from 'express';
import {
  getStaffs,
  getUnits,
  getBills,
  getReservations,
  getComplaints,
  getActivityLogs,
  searchReservations,
  updateReservationTime,
  updateReservationAttendees,
  cancelReservation,
  updateBillPaymentStatus,
  markBillPaidUnauthorized,
  updateUnitPartial,
  deleteReservationLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/units', getUnits);
router.get('/bills', getBills);
router.get('/reservations', getReservations);
router.get('/complaints', getComplaints);
router.get('/activity-logs', getActivityLogs);
router.get('/reservations/search', searchReservations);

router.patch('/reservations/:id/time', updateReservationTime);
router.patch('/reservations/:id/attendees', updateReservationAttendees);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/bills/:id/pay-status', updateBillPaymentStatus);
router.post('/bills/:id/pay-unauthorized', markBillPaidUnauthorized);
router.patch('/units/:id/partial', updateUnitPartial);

router.delete('/reservation-logs/:id', deleteReservationLog);
router.post('/reset', resetData);

export default router;
