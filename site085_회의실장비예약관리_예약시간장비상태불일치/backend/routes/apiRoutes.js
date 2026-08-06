import express from 'express';
import {
  getRooms,
  getEquipments,
  getReservations,
  getEmployees,
  searchRooms,
  updateReservationEquipment,
  updateReservationTime,
  cancelReservation,
  returnEquipmentStatus,
  reserveEquipment,
  deleteReservation,
  updateEquipmentStatusUnauthorized,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/rooms', getRooms);
router.get('/equipments', getEquipments);
router.get('/reservations', getReservations);
router.get('/employees', getEmployees);
router.get('/rooms/search', searchRooms);

router.patch('/reservations/:id/equipment', updateReservationEquipment);
router.patch('/reservations/:id/time', updateReservationTime);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/return-equipment', returnEquipmentStatus);
router.post('/equipments/reserve', reserveEquipment);
router.delete('/reservations/:id', deleteReservation);
router.patch('/equipments/:id/status', updateEquipmentStatusUnauthorized);

router.post('/reset', resetData);

export default router;
