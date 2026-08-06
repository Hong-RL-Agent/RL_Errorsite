import express from 'express';
import {
  getStaffs, getTrailSections, getPatrolTeams, getReports, getActionLogs, getActivityLogs,
  searchReports, updateReportLocation, updateReportStatus,
  cancelReport, completeAction,
  clearDangerZoneUnauthorized, updateReportPartial,
  deleteActionLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/trail-sections', getTrailSections);
router.get('/patrol-teams', getPatrolTeams);
router.get('/reports', getReports);
router.get('/action-logs', getActionLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/reports/search', searchReports);

router.patch('/reports/:id/location', updateReportLocation);
router.patch('/reports/:id/status', updateReportStatus);
router.post('/reports/:id/cancel', cancelReport);
router.post('/reports/:id/complete-action', completeAction);
router.post('/reports/:id/clear-unauthorized', clearDangerZoneUnauthorized);
router.patch('/reports/:id/partial', updateReportPartial);
router.delete('/action-logs/:id', deleteActionLog);
router.post('/reset', resetData);

export default router;
