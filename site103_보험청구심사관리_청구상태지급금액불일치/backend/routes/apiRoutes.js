import express from 'express';
import {
  getAdjusters,
  getProducts,
  getPolicyholders,
  getClaims,
  getMemos,
  getPayouts,
  getActivityLogs,
  searchClaims,
  updateClaimStatus,
  updatePayoutAmount,
  rejectClaim,
  completeSupplement,
  approvePayoutUnauthorized,
  updatePolicyholderPartial,
  deletePayout,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/adjusters', getAdjusters);
router.get('/products', getProducts);
router.get('/policyholders', getPolicyholders);
router.get('/claims', getClaims);
router.get('/memos', getMemos);
router.get('/payouts', getPayouts);
router.get('/activity-logs', getActivityLogs);
router.get('/claims/search', searchClaims);

router.patch('/claims/:id/status', updateClaimStatus);
router.patch('/claims/:id/payout', updatePayoutAmount);
router.post('/claims/:id/reject', rejectClaim);
router.post('/claims/:id/supplement', completeSupplement);
router.post('/claims/:id/approve-unauthorized', approvePayoutUnauthorized);
router.patch('/policyholders/:id/partial', updatePolicyholderPartial);

router.delete('/payouts/:id', deletePayout);
router.post('/reset', resetData);

export default router;
