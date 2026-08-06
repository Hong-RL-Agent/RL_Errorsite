import express from 'express';
import {
  getStaffs, getMenus, getStudents, getAllergies, getSubMealRequests, getServingLogs, getActivityLogs,
  searchStudents, updateSubMealMenu, updateSubMealStatus,
  cancelSubMeal, completeServing,
  approveSubMealUnauthorized, updateStudentPartial,
  deleteServingLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/menus', getMenus);
router.get('/students', getStudents);
router.get('/allergies', getAllergies);
router.get('/sub-meal-requests', getSubMealRequests);
router.get('/serving-logs', getServingLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/students/search', searchStudents);

router.patch('/sub-meal-requests/:id/menu', updateSubMealMenu);
router.patch('/sub-meal-requests/:id/status', updateSubMealStatus);
router.post('/sub-meal-requests/:id/cancel', cancelSubMeal);
router.post('/sub-meal-requests/:id/complete-serving', completeServing);
router.post('/sub-meal-requests/:id/approve-unauthorized', approveSubMealUnauthorized);
router.patch('/students/:id/partial', updateStudentPartial);
router.delete('/serving-logs/:id', deleteServingLog);
router.post('/reset', resetData);

export default router;
