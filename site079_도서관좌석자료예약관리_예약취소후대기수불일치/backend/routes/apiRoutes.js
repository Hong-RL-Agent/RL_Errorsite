import express from 'express';
import {
  getSeats,
  getBooks,
  searchBooks,
  getBookDetail,
  getReservations,
  getUsers,
  updateCapacity,
  updateTimeSlot,
  reserveSeat,
  cancelReservation,
  deleteReservation,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/seats', getSeats);
router.get('/books', getBooks);
router.get('/books/search', searchBooks);
router.get('/books/:id', getBookDetail);
router.get('/reservations', getReservations);
router.get('/users', getUsers);

router.patch('/reservations/:id/capacity', updateCapacity);
router.patch('/reservations/:id/time', updateTimeSlot);
router.post('/seats/:id/reserve', reserveSeat);
router.post('/reservations/:id/cancel', cancelReservation);
router.delete('/reservations/:id', deleteReservation);

router.post('/reset', resetData);

export default router;
