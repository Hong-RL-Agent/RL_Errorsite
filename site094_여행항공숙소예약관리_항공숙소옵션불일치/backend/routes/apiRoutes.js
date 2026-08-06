import express from 'express';
import {
  getAdmins,
  getUsers,
  getDestinations,
  getFlights,
  getHotels,
  getOptions,
  getBookings,
  searchFlights,
  updateBookingHotel,
  updateBookingFlight,
  cancelBooking,
  addBookingOption,
  confirmBooking,
  updateTravelerPartial,
  deleteBookingOption,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/users', getUsers);
router.get('/destinations', getDestinations);
router.get('/flights', getFlights);
router.get('/hotels', getHotels);
router.get('/options', getOptions);
router.get('/bookings', getBookings);
router.get('/flights/search', searchFlights);

router.patch('/bookings/:id/hotel', updateBookingHotel);
router.patch('/bookings/:id/flight', updateBookingFlight);
router.post('/bookings/:id/cancel', cancelBooking);
router.post('/bookings/:id/add-option', addBookingOption);
router.post('/bookings/:id/confirm', confirmBooking);
router.patch('/bookings/:id/traveler', updateTravelerPartial);

router.delete('/bookings/:id/options/:optionId', deleteBookingOption);
router.post('/reset', resetData);

export default router;
