import express from 'express';
import {
  getStaffs, getDistricts, getVolunteers, getSchedules, getReports, getAssignmentLogs, getActivityLogs,
  searchSchedules, updateScheduleVolunteer, updateScheduleStatus,
  cancelSchedule, addFieldReport,
  confirmScheduleUnauthorized, updateVolunteerPartial,
  deleteAssignmentLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/districts', getDistricts);
router.get('/volunteers', getVolunteers);
router.get('/schedules', getSchedules);
router.get('/reports', getReports);
router.get('/assignment-logs', getAssignmentLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/schedules/search', searchSchedules);

router.patch('/schedules/:id/volunteer', updateScheduleVolunteer);
router.patch('/schedules/:id/status', updateScheduleStatus);
router.post('/schedules/:id/cancel', cancelSchedule);
router.post('/schedules/:id/add-report', addFieldReport);
router.post('/schedules/:id/confirm-unauthorized', confirmScheduleUnauthorized);
router.patch('/volunteers/:id/partial', updateVolunteerPartial);
router.delete('/assignment-logs/:id', deleteAssignmentLog);
router.post('/reset', resetData);

export default router;
