import express from 'express';
import {
  getStaffs, getEditors, getReporters, getArticles, getReviewComments, getPublishLogs, getActivityLogs,
  searchArticles, updateArticleEditor, updateArticleStatus,
  deleteArticle, addReviewComment,
  publishArticleUnauthorized, updateArticlePartial,
  deletePublishLog, resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/staffs', getStaffs);
router.get('/editors', getEditors);
router.get('/reporters', getReporters);
router.get('/articles', getArticles);
router.get('/review-comments', getReviewComments);
router.get('/publish-logs', getPublishLogs);
router.get('/activity-logs', getActivityLogs);
router.get('/articles/search', searchArticles);

router.patch('/articles/:id/editor', updateArticleEditor);
router.patch('/articles/:id/status', updateArticleStatus);
router.delete('/articles/:id', deleteArticle);
router.post('/articles/:id/comment', addReviewComment);
router.post('/articles/:id/publish-unauthorized', publishArticleUnauthorized);
router.patch('/articles/:id/partial', updateArticlePartial);
router.delete('/publish-logs/:id', deletePublishLog);
router.post('/reset', resetData);

export default router;
