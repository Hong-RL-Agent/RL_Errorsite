import express from 'express';
import {
  getWorkers, getZones, getInverters, getPanels, getMaintenanceJobs, getPowerLogs, getActivityLogs,
  searchPanels, updatePanelWorker, updatePanelStatus,
  cancelMaintenanceJob, calibratePowerOutput,
  calibratePowerUnauthorized, updatePanelPartial,
  deletePowerLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/workers', getWorkers);
router.get('/zones', getZones);
router.get('/inverters', getInverters);
router.get('/panels', getPanels);
router.get('/maintenance-jobs', getMaintenanceJobs);
router.get('/power-logs', getPowerLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/panels/search', searchPanels);

router.patch('/panels/:id/worker', updatePanelWorker);
router.patch('/panels/:id/status', updatePanelStatus);
router.post('/maintenance-jobs/:id/cancel', cancelMaintenanceJob);
router.post('/maintenance-jobs/:id/calibrate', calibratePowerOutput);
router.post('/maintenance-jobs/:id/calibrate-unauthorized', calibratePowerUnauthorized);
router.patch('/panels/:id/partial', updatePanelPartial);
router.delete('/power-logs/:id', deletePowerLog);
router.post('/reset', resetData);

export default router;
