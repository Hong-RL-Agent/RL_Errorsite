import express from 'express';
import {
  getStaffs, getChannels, getAdSlots, getPrograms, getSchedules, getBroadcastLogs, getActivityLogs,
  searchSchedules, updateScheduleTime, updateScheduleAdSlot,
  cancelSchedule, completeBroadcast,
  confirmScheduleUnauthorized, updateProgramPartial,
  deleteBroadcastLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/channels', getChannels);
router.get('/ad-slots', getAdSlots);
router.get('/programs', getPrograms);
router.get('/schedules', getSchedules);
router.get('/broadcast-logs', getBroadcastLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/schedules/search', searchSchedules);

router.patch('/schedules/:id/time', updateScheduleTime);
router.patch('/schedules/:id/ad-slot', updateScheduleAdSlot);
router.post('/schedules/:id/cancel', cancelSchedule);
router.post('/schedules/:id/complete-broadcast', completeBroadcast);
router.post('/schedules/:id/confirm-unauthorized', confirmScheduleUnauthorized);
router.patch('/programs/:id/partial', updateProgramPartial);
router.delete('/broadcast-logs/:id', deleteBroadcastLog);
router.post('/reset', resetData);

export default router;
