import express from 'express';
import {
  getStaffs, getArtisans, getCustomers, getOptions, getOrders, getCraftLogs, getActivityLogs,
  searchOrders, updateOrderOptionColor, updateOrderStatus,
  cancelOrder, shipOrder,
  shipOrderUnauthorized, updateCustomerPartial,
  deleteCraftLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/artisans', getArtisans);
router.get('/customers', getCustomers);
router.get('/options', getOptions);
router.get('/orders', getOrders);
router.get('/craft-logs', getCraftLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/orders/search', searchOrders);

router.patch('/orders/:id/option-color', updateOrderOptionColor);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/cancel', cancelOrder);
router.post('/orders/:id/ship', shipOrder);
router.post('/orders/:id/ship-unauthorized', shipOrderUnauthorized);
router.patch('/customers/:id/partial', updateCustomerPartial);
router.delete('/craft-logs/:id', deleteCraftLog);
router.post('/reset', resetData);

export default router;
