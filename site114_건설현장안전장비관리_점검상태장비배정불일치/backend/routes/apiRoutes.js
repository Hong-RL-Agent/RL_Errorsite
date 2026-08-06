import express from 'express';
import {
  getWorkers, getZones, getEquipments, getSafetyInspections, getSafetyTrainings, getActivityLogs,
  searchInspections, updateInspectionEquipment, updateInspectionStatus,
  cancelHazardReport, completeEquipmentInspection,
  completeInspectionUnauthorized, updateEquipmentPartial,
  deleteTrainingLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/workers', getWorkers);
router.get('/zones', getZones);
router.get('/equipments', getEquipments);
router.get('/inspections', getSafetyInspections);
router.get('/trainings', getSafetyTrainings);
router.get('/activity-logs', getActivityLogs);
router.get('/inspections/search', searchInspections);

router.patch('/inspections/:id/equipment', updateInspectionEquipment);
router.patch('/inspections/:id/status', updateInspectionStatus);
router.post('/inspections/:id/cancel-hazard', cancelHazardReport);
router.post('/inspections/:id/complete-equipment-inspection', completeEquipmentInspection);
router.post('/inspections/:id/complete-unauthorized', completeInspectionUnauthorized);
router.patch('/equipments/:id/partial', updateEquipmentPartial);
router.delete('/trainings/:id', deleteTrainingLog);
router.post('/reset', resetData);

export default router;
