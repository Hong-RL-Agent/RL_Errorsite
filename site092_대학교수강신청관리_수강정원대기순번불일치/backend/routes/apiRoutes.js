import express from 'express';
import {
  getAdmins,
  getCourses,
  getStudents,
  getRegistrations,
  getWaitlists,
  getCart,
  searchCourses,
  addToCart,
  registerCourse,
  cancelRegistration,
  autoPromoteWaitlist,
  updateCourseCapacity,
  updateCoursePartial,
  deleteRegistration,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/courses', getCourses);
router.get('/students', getStudents);
router.get('/registrations', getRegistrations);
router.get('/waitlists', getWaitlists);
router.get('/cart', getCart);
router.get('/courses/search', searchCourses);

router.post('/cart', addToCart);
router.post('/register', registerCourse);
router.post('/registrations/:id/cancel', cancelRegistration);
router.post('/waitlists/:id/auto-promote', autoPromoteWaitlist);
router.patch('/courses/:id/capacity', updateCourseCapacity);
router.patch('/courses/:id', updateCoursePartial);

router.delete('/registrations/:id', deleteRegistration);
router.post('/reset', resetData);

export default router;
