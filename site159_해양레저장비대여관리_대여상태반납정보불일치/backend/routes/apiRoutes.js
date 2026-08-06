import express from 'express';
import {
  getStaffs, getEquipments, getCustomers, getRentals, getReturnLogs, getSafetyLogs, getActivityLogs,
  searchRentals, updateRentalReturnTime, updateRentalStatus,
  cancelRental, completeReturn,
  confirmDamageUnauthorized, updateEquipmentPartial,
  deleteReturnLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/equipments', getEquipments);
router.get('/customers', getCustomers);
router.get('/rentals', getRentals);
router.get('/return-logs', getReturnLogs);
router.get('/safety-logs', getSafetyLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/rentals/search', searchRentals);

router.patch('/rentals/:id/return-time', updateRentalReturnTime);
router.patch('/rentals/:id/status', updateRentalStatus);
router.post('/rentals/:id/cancel', cancelRental);
router.post('/rentals/:id/complete-return', completeReturn);
router.post('/rentals/:id/confirm-damage-unauthorized', confirmDamageUnauthorized);
router.patch('/equipments/:id/partial', updateEquipmentPartial);
router.delete('/return-logs/:id', deleteReturnLog);
router.post('/reset', resetData);

export default router;
