import express from 'express';
import {
  getOperators, getEquipments, getInspections, getAlerts, getWaterLogs, getActivityLogs,
  searchEquipments, updateWaterMetrics, updateInspectionStatus,
  cancelInspection, processAlertAction,
  updateWaterMetricsUnauthorized, updateEquipmentPartial,
  deleteWaterLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/operators', getOperators);
router.get('/equipments', getEquipments);
router.get('/inspections', getInspections);
router.get('/alerts', getAlerts);
router.get('/water-logs', getWaterLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/equipments/search', searchEquipments);

router.patch('/inspections/:id/water-metrics', updateWaterMetrics);
router.patch('/inspections/:id/status', updateInspectionStatus);
router.post('/inspections/:id/cancel', cancelInspection);
router.post('/inspections/:id/process-alert', processAlertAction);
router.post('/inspections/:id/calibrate-unauthorized', updateWaterMetricsUnauthorized);
router.patch('/equipments/:id/partial', updateEquipmentPartial);
router.delete('/water-logs/:id', deleteWaterLog);
router.post('/reset', resetData);

export default router;
