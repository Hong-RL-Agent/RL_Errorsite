import express from 'express';
import {
  getStaffs, getDesigners, getTreatments, getClients, getReservations, getVisitLogs, getActivityLogs,
  searchReservations, updateReservationTreatment, updateReservationStatus,
  cancelReservation, completeReservation,
  refundReservationUnauthorized, updateClientPartial,
  deleteVisitLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/designers', getDesigners);
router.get('/treatments', getTreatments);
router.get('/clients', getClients);
router.get('/reservations', getReservations);
router.get('/visit-logs', getVisitLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/reservations/search', searchReservations);

router.patch('/reservations/:id/treatment', updateReservationTreatment);
router.patch('/reservations/:id/status', updateReservationStatus);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/complete', completeReservation);
router.post('/reservations/:id/refund-unauthorized', refundReservationUnauthorized);
router.patch('/clients/:id/partial', updateClientPartial);
router.delete('/visit-logs/:id', deleteVisitLog);
router.post('/reset', resetData);

export default router;
