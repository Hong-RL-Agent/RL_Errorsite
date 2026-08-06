import express from 'express';
import {
  getAdmins,
  getPlans,
  getOrganizations,
  getTeamMembers,
  getUsageLogs,
  getBillingHistories,
  searchOrganizations,
  updatePlan,
  updateLicenseSeats,
  cancelSubscription,
  refreshUsage,
  updatePlanUnauthorized,
  updateOrgPartial,
  deleteUsageLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/plans', getPlans);
router.get('/organizations', getOrganizations);
router.get('/team-members', getTeamMembers);
router.get('/usage-logs', getUsageLogs);
router.get('/billing-histories', getBillingHistories);
router.get('/organizations/search', searchOrganizations);

router.patch('/subscriptions/:id/plan', updatePlan);
router.patch('/organizations/:id/seats', updateLicenseSeats);
router.post('/subscriptions/:id/cancel', cancelSubscription);
router.post('/subscriptions/:id/refresh-usage', refreshUsage);
router.patch('/subscriptions/:id/plan-unauthorized', updatePlanUnauthorized);
router.patch('/organizations/:id/partial', updateOrgPartial);

router.delete('/usage-logs/:id', deleteUsageLog);
router.post('/reset', resetData);

export default router;
