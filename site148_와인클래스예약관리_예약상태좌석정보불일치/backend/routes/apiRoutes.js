import express from 'express';
import {
  getStaffs, getClassesList, getSeats, getCustomers, getBookings, getKitLogs, getActivityLogs,
  searchBookings, updateBookingSeat, updateBookingStatus,
  cancelBooking, markKitReady,
  confirmBookingUnauthorized, updateCustomerPartial,
  deleteKitLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/classes-list', getClassesList);
router.get('/seats', getSeats);
router.get('/customers', getCustomers);
router.get('/bookings', getBookings);
router.get('/kit-logs', getKitLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/bookings/search', searchBookings);

router.patch('/bookings/:id/seat', updateBookingSeat);
router.patch('/bookings/:id/status', updateBookingStatus);
router.post('/bookings/:id/cancel', cancelBooking);
router.post('/bookings/:id/kit-ready', markKitReady);
router.post('/bookings/:id/confirm-unauthorized', confirmBookingUnauthorized);
router.patch('/customers/:id/partial', updateCustomerPartial);
router.delete('/kit-logs/:id', deleteKitLog);
router.post('/reset', resetData);

export default router;
