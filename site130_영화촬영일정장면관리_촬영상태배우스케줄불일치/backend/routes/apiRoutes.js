import express from 'express';
import {
  getStaffs, getActors, getLocations, getScenes, getSchedules, getFilmingLogs, getActivityLogs,
  searchScenes, updateSceneActorSchedule, updateSceneStatus,
  cancelScene, completeFilmingLog,
  completeSceneUnauthorized, updateScenePartial,
  deleteFilmingLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/actors', getActors);
router.get('/locations', getLocations);
router.get('/scenes', getScenes);
router.get('/schedules', getSchedules);
router.get('/filming-logs', getFilmingLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/scenes/search', searchScenes);

router.patch('/scenes/:id/actor-schedule', updateSceneActorSchedule);
router.patch('/scenes/:id/status', updateSceneStatus);
router.post('/scenes/:id/cancel', cancelScene);
router.post('/scenes/:id/complete-log', completeFilmingLog);
router.post('/scenes/:id/complete-unauthorized', completeSceneUnauthorized);
router.patch('/scenes/:id/partial', updateScenePartial);
router.delete('/filming-logs/:id', deleteFilmingLog);
router.post('/reset', resetData);

export default router;
