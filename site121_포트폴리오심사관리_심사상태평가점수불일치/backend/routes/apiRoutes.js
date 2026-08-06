import express from 'express';
import {
  getReviewers, getApplicants, getPortfolios, getEvaluations, getComments, getActivityLogs,
  searchApplicants, updateApplicantScore, updateApplicantStatus,
  cancelApplicant, addEvaluationComment,
  confirmPassUnauthorized, updateApplicantPartial,
  deleteEvaluation, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/reviewers', getReviewers);
router.get('/applicants', getApplicants);
router.get('/portfolios', getPortfolios);
router.get('/evaluations', getEvaluations);
router.get('/comments', getComments);
router.get('/activity-logs', getActivityLogs);
router.get('/applicants/search', searchApplicants);

router.patch('/applicants/:id/score', updateApplicantScore);
router.patch('/applicants/:id/status', updateApplicantStatus);
router.post('/applicants/:id/cancel', cancelApplicant);
router.post('/applicants/:id/add-comment', addEvaluationComment);
router.post('/applicants/:id/confirm-pass-unauthorized', confirmPassUnauthorized);
router.patch('/applicants/:id/partial', updateApplicantPartial);
router.delete('/evaluations/:id', deleteEvaluation);
router.post('/reset', resetData);

export default router;
