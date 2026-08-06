import express from 'express';
import {
  getStaffs, getBranches, getMembers, getSeats, getTickets, getEntryLogs, getActivityLogs,
  searchSeats, updateSeatTime, updateSeatStatus,
  cancelTicket, processCheckIn,
  forceCheckOutUnauthorized, updateMemberPartial,
  deleteEntryLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/branches', getBranches);
router.get('/members', getMembers);
router.get('/seats', getSeats);
router.get('/tickets', getTickets);
router.get('/entry-logs', getEntryLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/seats/search', searchSeats);

router.patch('/seats/:id/time', updateSeatTime);
router.patch('/seats/:id/status', updateSeatStatus);
router.post('/seats/:id/cancel-ticket', cancelTicket);
router.post('/seats/:id/process-checkin', processCheckIn);
router.post('/seats/:id/force-checkout-unauthorized', forceCheckOutUnauthorized);
router.patch('/members/:id/partial', updateMemberPartial);
router.delete('/entry-logs/:id', deleteEntryLog);
router.post('/reset', resetData);

export default router;
