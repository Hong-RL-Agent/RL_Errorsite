import express from 'express';
import {
  getAdmins,
  getZones,
  getCrops,
  getSensors,
  getWorkLogs,
  getAlerts,
  searchSensors,
  updateIrrigationVolume,
  updateIrrigationTime,
  cancelWorkLog,
  resolveAlert,
  irrigateCrop,
  updateCropPartial,
  deleteAlert,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/zones', getZones);
router.get('/crops', getCrops);
router.get('/sensors', getSensors);
router.get('/work-logs', getWorkLogs);
router.get('/alerts', getAlerts);
router.get('/sensors/search', searchSensors);

router.patch('/crops/:id/irrigation-volume', updateIrrigationVolume);
router.patch('/crops/:id/irrigation-time', updateIrrigationTime);
router.post('/work-logs/:id/cancel', cancelWorkLog);
router.post('/alerts/:id/resolve', resolveAlert);
router.post('/crops/:id/irrigate', irrigateCrop);
router.patch('/crops/:id', updateCropPartial);
router.delete('/alerts/:id', deleteAlert);

router.post('/reset', resetData);

export default router;
