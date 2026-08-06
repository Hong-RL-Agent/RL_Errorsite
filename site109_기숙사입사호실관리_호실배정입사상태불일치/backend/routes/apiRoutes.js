import express from 'express';
import {
  getStaffs,
  getStudents,
  getRooms,
  getApplications,
  getActivityLogs,
  searchStudents,
  updateStudentRoom,
  updateStudentStatus,
  checkoutStudent,
  updateRoomOccupancy,
  forceChangeRoomUnauthorized,
  updateStudentPartial,
  deleteAllocationLog,
  approveApplication,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/students', getStudents);
router.get('/rooms', getRooms);
router.get('/applications', getApplications);
router.get('/activity-logs', getActivityLogs);
router.get('/students/search', searchStudents);

router.patch('/students/:id/room', updateStudentRoom);
router.patch('/students/:id/status', updateStudentStatus);
router.post('/students/:id/checkout', checkoutStudent);
router.post('/rooms/:id/occupancy', updateRoomOccupancy);
router.post('/rooms/:id/force-change-unauthorized', forceChangeRoomUnauthorized);
router.patch('/students/:id/partial', updateStudentPartial);
router.post('/applications/:id/approve', approveApplication);

router.delete('/allocation-logs/:id', deleteAllocationLog);
router.post('/reset', resetData);

export default router;
