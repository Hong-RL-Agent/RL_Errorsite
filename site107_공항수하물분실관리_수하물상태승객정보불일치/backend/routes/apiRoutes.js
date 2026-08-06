import express from 'express';
import {
  getStaffs,
  getFlights,
  getPassengers,
  getBaggage,
  getLostClaims,
  getActivityLogs,
  searchBaggage,
  updateBaggageStatus,
  updateBaggageHandler,
  cancelLostClaim,
  updateBaggageLocation,
  closeClaimUnauthorized,
  updatePassengerPartial,
  deleteProcessingLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/flights', getFlights);
router.get('/passengers', getPassengers);
router.get('/baggage', getBaggage);
router.get('/lost-claims', getLostClaims);
router.get('/activity-logs', getActivityLogs);
router.get('/baggage/search', searchBaggage);

router.patch('/baggage/:id/status', updateBaggageStatus);
router.patch('/baggage/:id/handler', updateBaggageHandler);
router.post('/lost-claims/:id/cancel', cancelLostClaim);
router.post('/baggage/:id/location', updateBaggageLocation);
router.post('/lost-claims/:id/close-unauthorized', closeClaimUnauthorized);
router.patch('/passengers/:id/partial', updatePassengerPartial);

router.delete('/processing-logs/:id', deleteProcessingLog);
router.post('/reset', resetData);

export default router;
