import express from 'express';
import {
  getAdmins,
  getDepartments,
  getQuestions,
  getPatients,
  getSurveys,
  getAppointments,
  getActivityLogs,
  searchSurveys,
  updateSurveyAnswers,
  updateAppointmentTime,
  cancelAppointment,
  submitSurvey,
  updateSurveyRisk,
  updatePatientPartial,
  deleteSurvey,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/departments', getDepartments);
router.get('/questions', getQuestions);
router.get('/patients', getPatients);
router.get('/surveys', getSurveys);
router.get('/appointments', getAppointments);
router.get('/activity-logs', getActivityLogs);
router.get('/surveys/search', searchSurveys);

router.patch('/surveys/:id/answers', updateSurveyAnswers);
router.patch('/appointments/:id/time', updateAppointmentTime);
router.post('/appointments/:id/cancel', cancelAppointment);
router.post('/surveys/submit', submitSurvey);
router.patch('/surveys/:id/risk', updateSurveyRisk);
router.patch('/patients/:id/partial', updatePatientPartial);

router.delete('/surveys/:id', deleteSurvey);
router.post('/reset', resetData);

export default router;
