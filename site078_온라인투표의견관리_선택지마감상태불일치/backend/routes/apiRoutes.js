import express from 'express';
import {
  getVotes,
  searchVotes,
  getVoteDetail,
  createVote,
  closeVote,
  updateOptions,
  castVote,
  deleteParticipant,
  updateComment,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/votes', getVotes);
router.get('/votes/search', searchVotes);
router.get('/votes/:id', getVoteDetail);
router.post('/votes', createVote);

router.post('/votes/:id/close', closeVote);
router.patch('/votes/:id/options', updateOptions);
router.post('/votes/:id/cast', castVote);
router.delete('/participants/:id', deleteParticipant);
router.patch('/comments/:id', updateComment);

router.post('/reset', resetData);

export default router;
