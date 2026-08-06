import express from 'express';
import {
  getAdmins,
  getRooms,
  getReservations,
  getStaff,
  getCleaningLogs,
  getRequests,
  searchRooms,
  updateRoomStatus,
  updateRoomStaff,
  checkoutRoom,
  completeCleaning,
  inspectRoom,
  updateRoomPartial,
  deleteCleaningLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/rooms', getRooms);
router.get('/reservations', getReservations);
router.get('/staff', getStaff);
router.get('/cleaning-logs', getCleaningLogs);
router.get('/requests', getRequests);
router.get('/rooms/search', searchRooms);

router.patch('/rooms/:id/status', updateRoomStatus);
router.patch('/rooms/:id/staff', updateRoomStaff);
router.post('/rooms/:id/checkout', checkoutRoom);
router.post('/rooms/:id/complete-cleaning', completeCleaning);
router.post('/rooms/:id/inspect', inspectRoom);
router.patch('/rooms/:id', updateRoomPartial);

router.delete('/cleaning-logs/:id', deleteCleaningLog);
router.post('/reset', resetData);

export default router;
