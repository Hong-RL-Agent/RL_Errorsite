import express from 'express';
import {
  getStaffs, getBranches, getPackages, getVehicles, getBookings, getWorkLogs, getActivityLogs,
  searchBookings, updateBookingOptions, updateBookingStatus,
  cancelBooking, completeWorkLog,
  refundBookingUnauthorized, updateVehiclePartial,
  deleteWorkLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/branches', getBranches);
router.get('/packages', getPackages);
router.get('/vehicles', getVehicles);
router.get('/bookings', getBookings);
router.get('/work-logs', getWorkLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/bookings/search', searchBookings);

router.patch('/bookings/:id/options', updateBookingOptions);
router.patch('/bookings/:id/status', updateBookingStatus);
router.post('/bookings/:id/cancel', cancelBooking);
router.post('/bookings/:id/complete-log', completeWorkLog);
router.post('/bookings/:id/refund-unauthorized', refundBookingUnauthorized);
router.patch('/vehicles/:id/partial', updateVehiclePartial);
router.delete('/work-logs/:id', deleteWorkLog);
router.post('/reset', resetData);

export default router;
