import express from 'express';
import {
  getUsers,
  getCenters,
  getDrivers,
  getOrders,
  getLogs,
  getInquiries,
  searchOrders,
  updateDriver,
  updateOrderStatus,
  cancelOrder,
  reassignDriver,
  updateAddressPartial,
  deleteLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/users', getUsers);
router.get('/centers', getCenters);
router.get('/drivers', getDrivers);
router.get('/orders', getOrders);
router.get('/logs', getLogs);
router.get('/inquiries', getInquiries);
router.get('/orders/search', searchOrders);

router.patch('/orders/:id/driver', updateDriver);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/cancel', cancelOrder);
router.post('/orders/:id/reassign', reassignDriver);
router.patch('/orders/:id/address', updateAddressPartial);
router.delete('/logs/:id', deleteLog);

router.post('/reset', resetData);

export default router;
