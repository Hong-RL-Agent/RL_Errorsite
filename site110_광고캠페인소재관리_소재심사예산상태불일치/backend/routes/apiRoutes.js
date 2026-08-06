import express from 'express';
import {
  getStaffs,
  getAdvertisers,
  getCampaigns,
  getCreatives,
  getActivityLogs,
  searchCampaigns,
  approveCreative,
  updateCampaignBudget,
  pauseCampaign,
  completeCreativeAudit,
  approveCreativeUnauthorized,
  updateCampaignPartial,
  deleteBudgetLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/advertisers', getAdvertisers);
router.get('/campaigns', getCampaigns);
router.get('/creatives', getCreatives);
router.get('/activity-logs', getActivityLogs);
router.get('/campaigns/search', searchCampaigns);

router.post('/creatives/:id/approve', approveCreative);
router.patch('/campaigns/:id/budget', updateCampaignBudget);
router.post('/campaigns/:id/pause', pauseCampaign);
router.post('/creatives/:id/complete-audit', completeCreativeAudit);
router.post('/creatives/:id/approve-unauthorized', approveCreativeUnauthorized);
router.patch('/campaigns/:id/partial', updateCampaignPartial);

router.delete('/budget-logs/:id', deleteBudgetLog);
router.post('/reset', resetData);

export default router;
