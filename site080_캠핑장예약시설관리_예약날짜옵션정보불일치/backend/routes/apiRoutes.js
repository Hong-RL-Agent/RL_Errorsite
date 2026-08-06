import express from 'express';
import {
  getCampsites,
  searchCampsites,
  getCampsiteDetail,
  getSites,
  getReservations,
  getReviews,
  addOption,
  updateDates,
  reserveSite,
  cancelReservation,
  deleteReservation,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/campsites', getCampsites);
router.get('/campsites/search', searchCampsites);
router.get('/campsites/:id', getCampsiteDetail);
router.get('/sites', getSites);
router.get('/reservations', getReservations);
router.get('/reviews', getReviews);

router.post('/reservations/:id/options', addOption);
router.patch('/reservations/:id/dates', updateDates);
router.post('/sites/:id/reserve', reserveSite);
router.post('/reservations/:id/cancel', cancelReservation);
router.delete('/reservations/:id', deleteReservation);

router.post('/reset', resetData);

export default router;
