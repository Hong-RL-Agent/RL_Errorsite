import express from 'express';
import {
  getStaffs, getZones, getVehicles, getSchedules, getComplaints, getPickupLogs, getActivityLogs,
  searchSchedules, updateScheduleVehicle, updateScheduleStatus,
  cancelSchedule, resolveComplaint,
  completeScheduleUnauthorized, updateVehiclePartial,
  deletePickupLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/zones', getZones);
router.get('/vehicles', getVehicles);
router.get('/schedules', getSchedules);
router.get('/complaints', getComplaints);
router.get('/pickup-logs', getPickupLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/schedules/search', searchSchedules);

router.patch('/schedules/:id/vehicle', updateScheduleVehicle);
router.patch('/schedules/:id/status', updateScheduleStatus);
router.post('/schedules/:id/cancel', cancelSchedule);
router.post('/schedules/:id/resolve-complaint', resolveComplaint);
router.post('/schedules/:id/complete-unauthorized', completeScheduleUnauthorized);
router.patch('/vehicles/:id/partial', updateVehiclePartial);
router.delete('/pickup-logs/:id', deletePickupLog);
router.post('/reset', resetData);

export default router;
