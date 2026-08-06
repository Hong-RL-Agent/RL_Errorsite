import express from 'express';
import {
  getUsers,
  getShows,
  getSeats,
  getReservations,
  getTicketLogs,
  searchSeats,
  updatePurchaser,
  updateSeat,
  cancelReservation,
  issueTicket,
  updateShowPartial,
  deleteReservation,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/users', getUsers);
router.get('/shows', getShows);
router.get('/seats', getSeats);
router.get('/reservations', getReservations);
router.get('/ticket-logs', getTicketLogs);
router.get('/seats/search', searchSeats);

router.patch('/reservations/:id/purchaser', updatePurchaser);
router.patch('/reservations/:id/seat', updateSeat);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/issue', issueTicket);
router.patch('/shows/:id', updateShowPartial);
router.delete('/reservations/:id', deleteReservation);

router.post('/reset', resetData);

export default router;
