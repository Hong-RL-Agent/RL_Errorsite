import express from 'express';
import {
  getStaffs, getCounters, getPassengers, getOrders, getProducts, getPickupLogs, getActivityLogs,
  searchOrders, updateItemQuantity, updateOrderStatus,
  cancelOrder, completePickup,
  completePickupUnauthorized, updatePassengerPartial,
  deletePickupLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/counters', getCounters);
router.get('/passengers', getPassengers);
router.get('/orders', getOrders);
router.get('/products', getProducts);
router.get('/pickup-logs', getPickupLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/orders/search', searchOrders);

router.patch('/orders/:id/quantity', updateItemQuantity);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/cancel', cancelOrder);
router.post('/orders/:id/complete-pickup', completePickup);
router.post('/orders/:id/complete-unauthorized', completePickupUnauthorized);
router.patch('/passengers/:id/partial', updatePassengerPartial);
router.delete('/pickup-logs/:id', deletePickupLog);
router.post('/reset', resetData);

export default router;
