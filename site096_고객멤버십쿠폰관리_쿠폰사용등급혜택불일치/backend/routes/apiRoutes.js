import express from 'express';
import {
  getAdmins,
  getTiers,
  getCustomers,
  getCoupons,
  getPoints,
  getPurchases,
  getActivityLogs,
  searchCustomers,
  updateCustomerTier,
  issueCoupon,
  cancelCouponUsage,
  earnPoints,
  downgradeTier,
  updateCustomerPartial,
  deleteCouponUsage,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/tiers', getTiers);
router.get('/customers', getCustomers);
router.get('/coupons', getCoupons);
router.get('/points', getPoints);
router.get('/purchases', getPurchases);
router.get('/activity-logs', getActivityLogs);
router.get('/customers/search', searchCustomers);

router.patch('/customers/:id/tier', updateCustomerTier);
router.post('/customers/:id/issue-coupon', issueCoupon);
router.post('/coupons/:id/cancel-use', cancelCouponUsage);
router.post('/customers/:id/earn-points', earnPoints);
router.patch('/customers/:id/tier/downgrade', downgradeTier);
router.patch('/customers/:id/partial', updateCustomerPartial);

router.delete('/coupons/:id/usage', deleteCouponUsage);
router.post('/reset', resetData);

export default router;
