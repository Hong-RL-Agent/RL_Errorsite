import express from 'express';
import {
  getStaffs, getClasses, getStudents, getArtworks, getEvaluations, getFeedbacks, getActivityLogs,
  searchArtworks, updateArtworkScore, updateArtworkStatus,
  cancelSubmission, addFeedback,
  confirmScoreUnauthorized, updateStudentPartial,
  deleteFeedback, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/classes', getClasses);
router.get('/students', getStudents);
router.get('/artworks', getArtworks);
router.get('/evaluations', getEvaluations);
router.get('/feedbacks', getFeedbacks);
router.get('/activity-logs', getActivityLogs);
router.get('/artworks/search', searchArtworks);

router.patch('/artworks/:id/score', updateArtworkScore);
router.patch('/artworks/:id/status', updateArtworkStatus);
router.post('/artworks/:id/cancel', cancelSubmission);
router.post('/artworks/:id/feedback', addFeedback);
router.post('/artworks/:id/confirm-score-unauthorized', confirmScoreUnauthorized);
router.patch('/students/:id/partial', updateStudentPartial);
router.delete('/feedbacks/:id', deleteFeedback);
router.post('/reset', resetData);

export default router;
