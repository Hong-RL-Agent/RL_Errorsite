import express from 'express';
import {
  getStaffs, getStores, getProducts, getDiscountLogs, getDisposalLogs, getActivityLogs,
  searchProducts, updateProductDiscountRate, updateProductStatus,
  cancelDisposal, completeSoldOut,
  confirmDisposalUnauthorized, updateProductPartial,
  deleteDisposalLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/stores', getStores);
router.get('/products', getProducts);
router.get('/discount-logs', getDiscountLogs);
router.get('/disposal-logs', getDisposalLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/products/search', searchProducts);

router.patch('/products/:id/discount', updateProductDiscountRate);
router.patch('/products/:id/status', updateProductStatus);
router.post('/products/:id/cancel-disposal', cancelDisposal);
router.post('/products/:id/complete-soldout', completeSoldOut);
router.post('/products/:id/confirm-disposal-unauthorized', confirmDisposalUnauthorized);
router.patch('/products/:id/partial', updateProductPartial);
router.delete('/disposal-logs/:id', deleteDisposalLog);
router.post('/reset', resetData);

export default router;
