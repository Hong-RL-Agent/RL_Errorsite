import express from 'express';
import {
  getSellers,
  getProducts,
  getBuyers,
  getOrders,
  getSettlements,
  getDeliveryLogs,
  searchOrders,
  updateOrderStatus,
  updateSettlementAmount,
  cancelOrder,
  registerTracking,
  cancelOrderUnauthorized,
  updateProductPartial,
  deleteSettlement,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/sellers', getSellers);
router.get('/products', getProducts);
router.get('/buyers', getBuyers);
router.get('/orders', getOrders);
router.get('/settlements', getSettlements);
router.get('/delivery-logs', getDeliveryLogs);
router.get('/orders/search', searchOrders);

router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/settlements/:id/amount', updateSettlementAmount);
router.post('/orders/:id/cancel', cancelOrder);
router.post('/orders/:id/tracking', registerTracking);
router.post('/orders/:id/cancel-unauthorized', cancelOrderUnauthorized);
router.patch('/products/:id/partial', updateProductPartial);

router.delete('/settlements/:id', deleteSettlement);
router.post('/reset', resetData);

export default router;
