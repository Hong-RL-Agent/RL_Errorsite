import express from 'express';
import {
  getStaffs, getRoutesList, getBuses, getDrivers, getSchedules, getBoardingLogs, getActivityLogs,
  searchSchedules, updateSchedulePassengerCount, updateScheduleStatus,
  cancelSchedule, recordBoardingLog,
  completeScheduleUnauthorized, updateBusPartial,
  deleteBoardingLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/routes-list', getRoutesList);
router.get('/buses', getBuses);
router.get('/drivers', getDrivers);
router.get('/schedules', getSchedules);
router.get('/boarding-logs', getBoardingLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/schedules/search', searchSchedules);

router.patch('/schedules/:id/passenger-count', updateSchedulePassengerCount);
router.patch('/schedules/:id/status', updateScheduleStatus);
router.post('/schedules/:id/cancel', cancelSchedule);
router.post('/schedules/:id/record-boarding', recordBoardingLog);
router.post('/schedules/:id/complete-unauthorized', completeScheduleUnauthorized);
router.patch('/buses/:id/partial', updateBusPartial);
router.delete('/boarding-logs/:id', deleteBoardingLog);
router.post('/reset', resetData);

export default router;
