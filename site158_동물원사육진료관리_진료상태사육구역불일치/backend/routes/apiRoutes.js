import express from 'express';
import {
  getStaffs, getHabitats, getZookeepers, getAnimals, getMedicalRecords, getFeedingLogs, getActivityLogs,
  searchAnimals, updateAnimalHabitatZone, updateAnimalStatus,
  cancelTreatment, registerFeedingLog,
  completeTreatmentUnauthorized, updateAnimalPartial,
  deleteFeedingLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/habitats', getHabitats);
router.get('/zookeepers', getZookeepers);
router.get('/animals', getAnimals);
router.get('/medical-records', getMedicalRecords);
router.get('/feeding-logs', getFeedingLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/animals/search', searchAnimals);

router.patch('/animals/:id/habitat-zone', updateAnimalHabitatZone);
router.patch('/animals/:id/status', updateAnimalStatus);
router.post('/animals/:id/cancel-treatment', cancelTreatment);
router.post('/animals/:id/register-feeding', registerFeedingLog);
router.post('/animals/:id/complete-unauthorized', completeTreatmentUnauthorized);
router.patch('/animals/:id/partial', updateAnimalPartial);
router.delete('/feeding-logs/:id', deleteFeedingLog);
router.post('/reset', resetData);

export default router;
