import express from 'express';
import {
  getAdmins,
  getProjects,
  getTeamMembers,
  getIssues,
  getComments,
  getWorkLogs,
  searchIssues,
  updateIssueStatus,
  updateIssueAssignee,
  deleteIssue,
  addComment,
  deleteProject,
  updateIssuePartial,
  deleteWorkLog,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/admins', getAdmins);
router.get('/projects', getProjects);
router.get('/team-members', getTeamMembers);
router.get('/issues', getIssues);
router.get('/comments', getComments);
router.get('/work-logs', getWorkLogs);
router.get('/issues/search', searchIssues);

router.patch('/issues/:id/status', updateIssueStatus);
router.patch('/issues/:id/assignee', updateIssueAssignee);
router.delete('/issues/:id', deleteIssue);
router.post('/issues/:id/comments', addComment);
router.delete('/projects/:id', deleteProject);
router.patch('/issues/:id/partial', updateIssuePartial);

router.delete('/logs/:id', deleteWorkLog);
router.post('/reset', resetData);

export default router;
