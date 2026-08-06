import express from 'express';
import {
  getStaffs, getInstructors, getStudents, getCourses, getEnrollments, getAttendanceLogs, getActivityLogs,
  searchCourses, updateCourseEnrolledCount, updateCourseStatus,
  cancelEnrollment, markAttendance,
  cancelCourseUnauthorized, updateCoursePartial,
  deleteAttendanceLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/instructors', getInstructors);
router.get('/students', getStudents);
router.get('/courses', getCourses);
router.get('/enrollments', getEnrollments);
router.get('/attendance-logs', getAttendanceLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/courses/search', searchCourses);

router.patch('/courses/:id/enrolled-count', updateCourseEnrolledCount);
router.patch('/courses/:id/status', updateCourseStatus);
router.post('/enrollments/:id/cancel', cancelEnrollment);
router.post('/enrollments/:id/mark-attendance', markAttendance);
router.post('/courses/:id/cancel-unauthorized', cancelCourseUnauthorized);
router.patch('/courses/:id/partial', updateCoursePartial);
router.delete('/attendance-logs/:id', deleteAttendanceLog);
router.post('/reset', resetData);

export default router;
