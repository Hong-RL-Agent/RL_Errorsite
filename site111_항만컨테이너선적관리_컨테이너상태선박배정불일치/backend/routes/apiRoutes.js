import express from 'express';
import {
  getStaffs, getVessels, getYards, getContainers, getActivityLogs,
  searchContainers, updateContainerYard, assignVessel,
  cancelContainerExport, completeLoading,
  assignVesselUnauthorized, updateContainerPartial,
  deleteLoadingLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/vessels', getVessels);
router.get('/yards', getYards);
router.get('/containers', getContainers);
router.get('/activity-logs', getActivityLogs);
router.get('/containers/search', searchContainers);

router.patch('/containers/:id/yard', updateContainerYard);
router.patch('/containers/:id/vessel', assignVessel);
router.post('/containers/:id/cancel-export', cancelContainerExport);
router.post('/containers/:id/complete-loading', completeLoading);
router.post('/containers/:id/assign-unauthorized', assignVesselUnauthorized);
router.patch('/containers/:id/partial', updateContainerPartial);

router.delete('/loading-logs/:id', deleteLoadingLog);
router.post('/reset', resetData);

export default router;
