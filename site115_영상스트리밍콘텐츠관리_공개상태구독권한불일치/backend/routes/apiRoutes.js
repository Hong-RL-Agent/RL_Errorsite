import express from 'express';
import {
  getStaffs, getPlans, getSeries, getContents, getUsers, getWatchLogs, getActivityLogs,
  searchContents, updateContentPlan, updateContentStatus,
  makeContentPrivate, addWatchLog,
  publishContentUnauthorized, updateContentPartial,
  deleteWatchLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/plans', getPlans);
router.get('/series', getSeries);
router.get('/contents', getContents);
router.get('/users', getUsers);
router.get('/watch-logs', getWatchLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/contents/search', searchContents);

router.patch('/contents/:id/plan', updateContentPlan);
router.patch('/contents/:id/status', updateContentStatus);
router.post('/contents/:id/make-private', makeContentPrivate);
router.post('/contents/:id/watch-log', addWatchLog);
router.post('/contents/:id/publish-unauthorized', publishContentUnauthorized);
router.patch('/contents/:id/partial', updateContentPartial);
router.delete('/watch-logs/:id', deleteWatchLog);
router.post('/reset', resetData);

export default router;
