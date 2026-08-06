import express from 'express';
import {
  getCurators, getGalleries, getArtifacts, getLoanRequests, getActivityLogs,
  searchArtifacts, updateArtifactGallery, updateArtifactConservation,
  cancelLoanRequest, completeReturn,
  approveLoanUnauthorized, updateArtifactPartial,
  deleteConservationLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/curators', getCurators);
router.get('/galleries', getGalleries);
router.get('/artifacts', getArtifacts);
router.get('/loan-requests', getLoanRequests);
router.get('/activity-logs', getActivityLogs);
router.get('/artifacts/search', searchArtifacts);

router.patch('/artifacts/:id/gallery', updateArtifactGallery);
router.patch('/artifacts/:id/conservation', updateArtifactConservation);
router.post('/loan-requests/:id/cancel', cancelLoanRequest);
router.post('/loan-requests/:id/complete-return', completeReturn);
router.post('/loan-requests/:id/approve-unauthorized', approveLoanUnauthorized);
router.patch('/artifacts/:id/partial', updateArtifactPartial);
router.delete('/conservation-logs/:id', deleteConservationLog);
router.post('/reset', resetData);

export default router;
