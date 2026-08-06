import express from 'express';
import {
  getStaffs, getSubjects, getExamCenters, getExaminees, getScores, getActivityLogs,
  searchExaminees, updateExamineeScore, updateExamineeStatus,
  cancelRegistration, completeScoring,
  passExamineeUnauthorized, updateExamineePartial,
  deleteScore, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/subjects', getSubjects);
router.get('/exam-centers', getExamCenters);
router.get('/examinees', getExaminees);
router.get('/scores', getScores);
router.get('/activity-logs', getActivityLogs);
router.get('/examinees/search', searchExaminees);

router.patch('/examinees/:id/score', updateExamineeScore);
router.patch('/examinees/:id/status', updateExamineeStatus);
router.post('/examinees/:id/cancel', cancelRegistration);
router.post('/examinees/:id/complete-scoring', completeScoring);
router.post('/examinees/:id/pass-unauthorized', passExamineeUnauthorized);
router.patch('/examinees/:id/partial', updateExamineePartial);
router.delete('/scores/:id', deleteScore);
router.post('/reset', resetData);

export default router;
