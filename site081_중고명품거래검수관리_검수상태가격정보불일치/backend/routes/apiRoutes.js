import express from 'express';
import {
  getProducts,
  searchProducts,
  getProductDetail,
  getInspections,
  getTransactions,
  getSellers,
  updateInspectionStatus,
  updatePrice,
  rejectProduct,
  updateDescription,
  purchaseProduct,
  deleteTransaction,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/search', searchProducts);
router.get('/products/:id', getProductDetail);
router.get('/inspections', getInspections);
router.get('/transactions', getTransactions);
router.get('/sellers', getSellers);

router.patch('/products/:id/inspection-status', updateInspectionStatus);
router.patch('/products/:id/price', updatePrice);
router.post('/products/:id/reject', rejectProduct);
router.patch('/products/:id/description', updateDescription);
router.post('/products/purchase', purchaseProduct);
router.delete('/transactions/:id', deleteTransaction);

router.post('/reset', resetData);

export default router;
