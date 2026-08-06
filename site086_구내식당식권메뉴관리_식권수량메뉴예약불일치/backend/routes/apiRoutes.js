import express from 'express';
import {
  getMenus,
  getTickets,
  getReservations,
  getEmployees,
  searchMenus,
  updateReservationMenu,
  updateReservationQuantity,
  cancelReservation,
  useTicketForReservation,
  createReservation,
  deleteReservation,
  deleteMenuUnauthorized,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/menus', getMenus);
router.get('/tickets', getTickets);
router.get('/reservations', getReservations);
router.get('/employees', getEmployees);
router.get('/menus/search', searchMenus);

router.patch('/reservations/:id/menu', updateReservationMenu);
router.patch('/reservations/:id/quantity', updateReservationQuantity);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/use-ticket', useTicketForReservation);
router.post('/reservations', createReservation);
router.delete('/reservations/:id', deleteReservation);
router.delete('/menus/:id', deleteMenuUnauthorized);

router.post('/reset', resetData);

export default router;
