import express from 'express';
import {
  getStaffs, getRooms, getUsers, getBookings, getAccessLogs, getEquipmentLogs, getActivityLogs,
  searchBookings, updateBookingEntryTime, updateBookingStatus,
  cancelBooking, checkInBooking,
  forceCancelBookingUnauthorized, updateUserPartial,
  deleteAccessLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/rooms', getRooms);
router.get('/users', getUsers);
router.get('/bookings', getBookings);
router.get('/access-logs', getAccessLogs);
router.get('/equipment-logs', getEquipmentLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/bookings/search', searchBookings);

router.patch('/bookings/:id/entry-time', updateBookingEntryTime);
router.patch('/bookings/:id/status', updateBookingStatus);
router.post('/bookings/:id/cancel', cancelBooking);
router.post('/bookings/:id/checkin', checkInBooking);
router.post('/bookings/:id/force-cancel-unauthorized', forceCancelBookingUnauthorized);
router.patch('/users/:id/partial', updateUserPartial);
router.delete('/access-logs/:id', deleteAccessLog);
router.post('/reset', resetData);

export default router;
