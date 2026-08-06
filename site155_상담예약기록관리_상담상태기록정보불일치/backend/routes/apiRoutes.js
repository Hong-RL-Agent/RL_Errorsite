import express from 'express';
import {
  getStaffs, getCounselors, getClients, getCounsels, getFollowups, getCounselLogs, getActivityLogs,
  searchCounsels, updateCounselNoteText, updateCounselStatus,
  cancelCounsel, registerFollowup,
  viewCounselLogUnauthorized, updateClientPartial,
  deleteCounselLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/counselors', getCounselors);
router.get('/clients', getClients);
router.get('/counsels', getCounsels);
router.get('/followups', getFollowups);
router.get('/counsel-logs', getCounselLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/counsels/search', searchCounsels);

router.patch('/counsels/:id/note-text', updateCounselNoteText);
router.patch('/counsels/:id/status', updateCounselStatus);
router.post('/counsels/:id/cancel', cancelCounsel);
router.post('/counsels/:id/register-followup', registerFollowup);
router.post('/counsels/:id/view-log-unauthorized', viewCounselLogUnauthorized);
router.patch('/clients/:id/partial', updateClientPartial);
router.delete('/counsel-logs/:id', deleteCounselLog);
router.post('/reset', resetData);

export default router;
