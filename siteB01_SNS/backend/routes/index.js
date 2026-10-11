const express = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const userController = require('../controllers/userController');
const notificationController = require('../controllers/notificationController');
const activityController = require('../controllers/activityController');
const testController = require('../controllers/testController');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok', site: 'B-01', name: 'Mingle', time: new Date().toISOString() }));

// feed / posts
router.get('/feed', postController.feed);
router.get('/saved', postController.saved);
router.post('/posts', postController.create);
router.get('/posts/:id', postController.get);
router.patch('/posts/:id', postController.update);
router.delete('/posts/:id', postController.remove);
router.post('/posts/:id/like', postController.like);
router.delete('/posts/:id/like', postController.unlike);
router.post('/posts/:id/save', postController.save);
router.delete('/posts/:id/save', postController.unsave);
router.get('/posts/:id/comments', postController.listComments);
router.post('/posts/:id/comments', postController.addComment);

// comments
router.delete('/comments/:id', commentController.remove);

// users
router.get('/me', userController.me);
router.get('/stories', userController.stories);
router.get('/users', userController.list);
router.get('/users/:id', userController.get);
router.get('/users/:id/following', userController.following);
router.post('/users/:id/follow', userController.follow);
router.delete('/users/:id/follow', userController.unfollow);

// notifications / activity
router.get('/notifications', notificationController.list);
router.patch('/notifications/read-all', notificationController.markAllRead);
router.patch('/notifications/:id/read', notificationController.markRead);
router.get('/activity', activityController.list);

// test
router.post('/test/reset', testController.reset);

module.exports = router;
