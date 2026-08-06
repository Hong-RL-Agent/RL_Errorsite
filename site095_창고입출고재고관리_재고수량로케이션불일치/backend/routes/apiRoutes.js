import express from 'express';
import {
  getAdmins,
  getProducts,
  getLocations,
  getInboundLogs,
  getOutboundLogs,
  getActivityLogs,
  searchProducts,
  updateProductLocation,
  updateProductStock,
  cancelOutbound,
  confirmInbound,
  updateStockQuantity,
  updateProductPartial,
  deleteLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/products', getProducts);
router.get('/locations', getLocations);
router.get('/inbound', getInboundLogs);
router.get('/outbound', getOutboundLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/products/search', searchProducts);

router.patch('/products/:id/location', updateProductLocation);
router.patch('/products/:id/stock', updateProductStock);
router.post('/outbound/:id/cancel', cancelOutbound);
router.post('/inbound/:id/confirm', confirmInbound);
router.patch('/products/:id/quantity', updateStockQuantity);
router.patch('/products/:id/partial', updateProductPartial);

router.delete('/logs/:id', deleteLog);
router.post('/reset', resetData);

export default router;
