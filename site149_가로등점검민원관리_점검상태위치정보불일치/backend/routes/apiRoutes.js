import express from 'express';
import {
  getStaffs, getLights, getWorkers, getReports, getTasks, getLocationLogs, getActivityLogs,
  searchReports, updateReportLocation, updateReportStatus,
  cancelReport, completeReport,
  completeReportUnauthorized, updateLightPartial,
  deleteLocationLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/lights', getLights);
router.get('/workers', getWorkers);
router.get('/reports', getReports);
router.get('/tasks', getTasks);
router.get('/location-logs', getLocationLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/reports/search', searchReports);

router.patch('/reports/:id/location', updateReportLocation);
router.patch('/reports/:id/status', updateReportStatus);
router.post('/reports/:id/cancel', cancelReport);
router.post('/reports/:id/complete', completeReport);
router.post('/reports/:id/complete-unauthorized', completeReportUnauthorized);
router.patch('/lights/:id/partial', updateLightPartial);
router.delete('/location-logs/:id', deleteLocationLog);
router.post('/reset', resetData);

export default router;
