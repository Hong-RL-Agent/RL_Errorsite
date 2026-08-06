import express from 'express';
import {
  getStaffs, getCustomers, getProducts, getReservations, getRetouchTasks, getDispatchLogs, getActivityLogs,
  searchReservations, updateRetouchOption, updateReservationStatus,
  cancelReservation, completeDispatch,
  completeDispatchUnauthorized, updateCustomerPartial,
  deleteDispatchLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/customers', getCustomers);
router.get('/products', getProducts);
router.get('/reservations', getReservations);
router.get('/retouch-tasks', getRetouchTasks);
router.get('/dispatch-logs', getDispatchLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/reservations/search', searchReservations);

router.patch('/reservations/:id/retouch-option', updateRetouchOption);
router.patch('/reservations/:id/status', updateReservationStatus);
router.post('/reservations/:id/cancel', cancelReservation);
router.post('/reservations/:id/complete-dispatch', completeDispatch);
router.post('/reservations/:id/dispatch-unauthorized', completeDispatchUnauthorized);
router.patch('/customers/:id/partial', updateCustomerPartial);
router.delete('/dispatch-logs/:id', deleteDispatchLog);
router.post('/reset', resetData);

export default router;
