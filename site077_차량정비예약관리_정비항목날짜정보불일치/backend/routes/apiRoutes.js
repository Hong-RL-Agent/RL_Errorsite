import express from 'express';
import {
  getCenters,
  searchCenters,
  getVehicles,
  getReservations,
  updateDate,
  updateServiceType,
  cancelReservation,
  updateStatus,
  deleteReservation,
  unauthorizedStatusChange,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/centers', getCenters);
router.get('/centers/search', searchCenters);
router.get('/vehicles', getVehicles);
router.get('/reservations', getReservations);

router.patch('/reservations/:id/date', updateDate);
router.patch('/reservations/:id/service-type', updateServiceType);
router.post('/reservations/:id/cancel', cancelReservation);
router.patch('/reservations/:id/status', updateStatus);
router.delete('/reservations/:id', deleteReservation);
router.post('/reservations/:id/unauthorized-status', unauthorizedStatusChange);

router.post('/reset', resetData);

export default router;
