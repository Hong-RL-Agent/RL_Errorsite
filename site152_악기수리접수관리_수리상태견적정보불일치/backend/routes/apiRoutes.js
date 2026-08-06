import express from 'express';
import {
  getStaffs, getInstruments, getCustomers, getRepairs, getEstimates, getRepairLogs, getActivityLogs,
  searchRepairs, updateRepairEstimatePrice, updateRepairStatus,
  cancelRepair, completeRepair,
  completeRepairUnauthorized, updateCustomerPartial,
  deleteRepairLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/instruments', getInstruments);
router.get('/customers', getCustomers);
router.get('/repairs', getRepairs);
router.get('/estimates', getEstimates);
router.get('/repair-logs', getRepairLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/repairs/search', searchRepairs);

router.patch('/repairs/:id/estimate-price', updateRepairEstimatePrice);
router.patch('/repairs/:id/status', updateRepairStatus);
router.post('/repairs/:id/cancel', cancelRepair);
router.post('/repairs/:id/complete', completeRepair);
router.post('/repairs/:id/complete-unauthorized', completeRepairUnauthorized);
router.patch('/customers/:id/partial', updateCustomerPartial);
router.delete('/repair-logs/:id', deleteRepairLog);
router.post('/reset', resetData);

export default router;
