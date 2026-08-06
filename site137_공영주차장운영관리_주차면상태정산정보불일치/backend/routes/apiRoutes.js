import express from 'express';
import {
  getStaffs, getParkingLots, getParkingSpaces, getParkingRecords, getSettlements, getActivityLogs,
  searchRecords, updateRecordFee, updateSpaceStatus,
  cancelExit, completeSettlement,
  cancelSettlementUnauthorized, updateVehiclePartial,
  deleteSettlement, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/parking-lots', getParkingLots);
router.get('/parking-spaces', getParkingSpaces);
router.get('/parking-records', getParkingRecords);
router.get('/settlements', getSettlements);
router.get('/activity-logs', getActivityLogs);
router.get('/parking-records/search', searchRecords);

router.patch('/parking-records/:id/fee', updateRecordFee);
router.patch('/parking-spaces/:id/status', updateSpaceStatus);
router.post('/parking-records/:id/cancel-exit', cancelExit);
router.post('/parking-records/:id/complete-settlement', completeSettlement);
router.post('/settlements/:id/cancel-unauthorized', cancelSettlementUnauthorized);
router.patch('/parking-records/:id/partial', updateVehiclePartial);
router.delete('/settlements/:id', deleteSettlement);
router.post('/reset', resetData);

export default router;
