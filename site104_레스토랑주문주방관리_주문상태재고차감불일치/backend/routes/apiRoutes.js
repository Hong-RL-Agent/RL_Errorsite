import express from 'express';
import {
  getChefs,
  getTables,
  getMenus,
  getIngredients,
  getOrders,
  getStockLogs,
  getActivityLogs,
  searchOrders,
  updateOrderStatus,
  updateOrderChef,
  cancelOrder,
  deductStock,
  disposeStockUnauthorized,
  updateMenuPartial,
  deleteStockLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/chefs', getChefs);
router.get('/tables', getTables);
router.get('/menus', getMenus);
router.get('/ingredients', getIngredients);
router.get('/orders', getOrders);
router.get('/stock-logs', getStockLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/orders/search', searchOrders);

router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/chef', updateOrderChef);
router.post('/orders/:id/cancel', cancelOrder);
router.post('/orders/:id/deduct-stock', deductStock);
router.post('/stock/:id/dispose-unauthorized', disposeStockUnauthorized);
router.patch('/menus/:id/partial', updateMenuPartial);

router.delete('/stock-logs/:id', deleteStockLog);
router.post('/reset', resetData);

export default router;
