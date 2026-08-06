import express from 'express';
import {
  getStudents,
  getConsultations,
  getCourses,
  searchCourses,
  getAttendance,
  updateConsultationStatus,
  updateConsultationTime,
  cancelEnrollment,
  checkAttendance,
  enrollCourse,
  deleteConsultation,
  updateAttendanceUnauthorized,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/students', getStudents);
router.get('/consultations', getConsultations);
router.get('/courses', getCourses);
router.get('/courses/search', searchCourses);
router.get('/attendance', getAttendance);

router.patch('/consultations/:id/status', updateConsultationStatus);
router.patch('/consultations/:id/time', updateConsultationTime);
router.post('/students/:id/cancel-enrollment', cancelEnrollment);
router.post('/attendance/check', checkAttendance);
router.post('/courses/enroll', enrollCourse);
router.delete('/consultations/:id', deleteConsultation);
router.patch('/attendance/:id', updateAttendanceUnauthorized);

router.post('/reset', resetData);

export default router;
