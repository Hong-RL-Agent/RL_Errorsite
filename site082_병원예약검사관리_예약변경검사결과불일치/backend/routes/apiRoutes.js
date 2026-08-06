import express from 'express';
import {
  getAppointments,
  searchAppointments,
  getTestResults,
  getTestResultDetail,
  getDoctors,
  getPatients,
  updateDoctor,
  updateTimeSlot,
  cancelAppointment,
  updateSymptoms,
  deleteAppointment,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/appointments', getAppointments);
router.get('/appointments/search', searchAppointments);
router.get('/test-results', getTestResults);
router.get('/test-results/:id', getTestResultDetail);
router.get('/doctors', getDoctors);
router.get('/patients', getPatients);

router.patch('/appointments/:id/doctor', updateDoctor);
router.patch('/appointments/:id/time', updateTimeSlot);
router.post('/appointments/:id/cancel', cancelAppointment);
router.patch('/appointments/:id/symptoms', updateSymptoms);
router.delete('/appointments/:id', deleteAppointment);

router.post('/reset', resetData);

export default router;
