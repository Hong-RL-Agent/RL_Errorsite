import express from 'express';
import {
  getStaffs, getBranches, getCustomers, getLockers, getContracts, getInOutLogs, getActivityLogs,
  searchLockers, updateLockerPeriod, updateLockerStatus,
  terminateContract, processItemIn,
  terminateContractUnauthorized, updateCustomerPartial,
  deleteInOutLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/branches', getBranches);
router.get('/customers', getCustomers);
router.get('/lockers', getLockers);
router.get('/contracts', getContracts);
router.get('/in-out-logs', getInOutLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/lockers/search', searchLockers);

router.patch('/lockers/:id/period', updateLockerPeriod);
router.patch('/lockers/:id/status', updateLockerStatus);
router.post('/lockers/:id/terminate', terminateContract);
router.post('/lockers/:id/process-in', processItemIn);
router.post('/lockers/:id/terminate-unauthorized', terminateContractUnauthorized);
router.patch('/customers/:id/partial', updateCustomerPartial);
router.delete('/in-out-logs/:id', deleteInOutLog);
router.post('/reset', resetData);

export default router;
