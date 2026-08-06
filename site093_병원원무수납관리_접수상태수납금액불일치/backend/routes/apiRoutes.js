import express from 'express';
import {
  getAdmins,
  getDepartments,
  getPatients,
  getRegistrations,
  getPayments,
  getActivityLogs,
  searchRegistrations,
  updateRegistrationDept,
  updateRegistrationAmount,
  cancelRegistration,
  completePayment,
  cancelPayment,
  updatePatientPartial,
  deletePayment,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/departments', getDepartments);
router.get('/patients', getPatients);
router.get('/registrations', getRegistrations);
router.get('/payments', getPayments);
router.get('/activity-logs', getActivityLogs);
router.get('/registrations/search', searchRegistrations);

router.patch('/registrations/:id/dept', updateRegistrationDept);
router.patch('/registrations/:id/amount', updateRegistrationAmount);
router.post('/registrations/:id/cancel', cancelRegistration);
router.post('/registrations/:id/complete-payment', completePayment);
router.post('/payments/:id/cancel', cancelPayment);
router.patch('/patients/:id', updatePatientPartial);

router.delete('/payments/:id', deletePayment);
router.post('/reset', resetData);

export default router;
