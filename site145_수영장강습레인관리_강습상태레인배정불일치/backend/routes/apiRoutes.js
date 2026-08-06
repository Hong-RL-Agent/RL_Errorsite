import express from 'express';
import {
  getStaffs, getLanes, getInstructors, getMembers, getAttendanceLogs, getActivityLogs,
  searchMembers, updateMemberLane, updateMemberStatus,
  cancelClass, completeAttendance,
  changeLaneUnauthorized, updateMemberPartial,
  deleteAttendanceLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/lanes', getLanes);
router.get('/instructors', getInstructors);
router.get('/members', getMembers);
router.get('/attendance-logs', getAttendanceLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/members/search', searchMembers);

router.patch('/members/:id/lane', updateMemberLane);
router.patch('/members/:id/status', updateMemberStatus);
router.post('/members/:id/cancel', cancelClass);
router.post('/members/:id/complete-attendance', completeAttendance);
router.post('/members/:id/change-lane-unauthorized', changeLaneUnauthorized);
router.patch('/members/:id/partial', updateMemberPartial);
router.delete('/attendance-logs/:id', deleteAttendanceLog);
router.post('/reset', resetData);

export default router;
