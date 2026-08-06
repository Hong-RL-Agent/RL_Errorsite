import express from 'express';
import {
  getStaffs, getZones, getVehicles, getWorkers, getTasks, getSnowLogs, getActivityLogs,
  searchTasks, updateTaskLocation, updateTaskStatus,
  cancelTask, registerSaltUsage,
  completeTaskUnauthorized, updateVehiclePartial,
  deleteSnowLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/zones', getZones);
router.get('/vehicles', getVehicles);
router.get('/workers', getWorkers);
router.get('/tasks', getTasks);
router.get('/snow-logs', getSnowLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/tasks/search', searchTasks);

router.patch('/tasks/:id/location', updateTaskLocation);
router.patch('/tasks/:id/status', updateTaskStatus);
router.post('/tasks/:id/cancel', cancelTask);
router.post('/tasks/:id/register-salt', registerSaltUsage);
router.post('/tasks/:id/complete-unauthorized', completeTaskUnauthorized);
router.patch('/vehicles/:id/partial', updateVehiclePartial);
router.delete('/snow-logs/:id', deleteSnowLog);
router.post('/reset', resetData);

export default router;
