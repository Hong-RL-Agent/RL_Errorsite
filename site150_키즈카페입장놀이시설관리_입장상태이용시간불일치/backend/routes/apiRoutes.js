import express from 'express';
import {
  getStaffs, getFacilities, getGuardians, getChildren, getTickets, getUsageLogs, getActivityLogs,
  searchTickets, updateTicketAllowedHours, updateTicketStatus,
  cancelTicket, recordUsageLog,
  forceCheckoutUnauthorized, updateGuardianPartial,
  deleteUsageLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/facilities', getFacilities);
router.get('/guardians', getGuardians);
router.get('/children', getChildren);
router.get('/tickets', getTickets);
router.get('/usage-logs', getUsageLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/tickets/search', searchTickets);

router.patch('/tickets/:id/allowed-hours', updateTicketAllowedHours);
router.patch('/tickets/:id/status', updateTicketStatus);
router.post('/tickets/:id/cancel', cancelTicket);
router.post('/tickets/:id/record-usage', recordUsageLog);
router.post('/tickets/:id/force-checkout-unauthorized', forceCheckoutUnauthorized);
router.patch('/guardians/:id/partial', updateGuardianPartial);
router.delete('/usage-logs/:id', deleteUsageLog);
router.post('/reset', resetData);

export default router;
